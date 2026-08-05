import type { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useOfflineQueueStore } from '@/store/useOfflineQueueStore'

import { AnimalsService } from '@/services/animals'

import { flushOfflineQueue, isConnectivityError, withOfflineQueue } from '../offlineQueue'

vi.mock('@/services/animals', () => ({
	AnimalsService: {
		setAnimal: vi.fn(),
		updateAnimal: vi.fn(),
	},
}))
vi.mock('@/services/healthRecords', () => ({
	HealthRecordsService: { setHealthRecord: vi.fn(), updateHealthRecord: vi.fn() },
}))
vi.mock('@/services/productionRecords', () => ({
	ProductionRecordsService: { setProductionRecord: vi.fn(), updateProductionRecord: vi.fn() },
}))

const setOnline = (online: boolean) => {
	Object.defineProperty(navigator, 'onLine', { value: online, configurable: true })
}

describe('offlineQueue', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		useOfflineQueueStore.setState({ queue: [] })
		setOnline(true)
	})

	describe('isConnectivityError', () => {
		it('is true when the browser reports no connection', () => {
			setOnline(false)
			expect(isConnectivityError(new Error('anything'))).toBe(true)
		})

		it('is true for Firebase functions/unavailable', () => {
			expect(isConnectivityError({ code: 'functions/unavailable' })).toBe(true)
		})

		it('is true for Firebase functions/deadline-exceeded', () => {
			expect(isConnectivityError({ code: 'functions/deadline-exceeded' })).toBe(true)
		})

		it('is true for a raw fetch TypeError', () => {
			expect(isConnectivityError(new TypeError('Failed to fetch'))).toBe(true)
		})

		it('is false for a real validation/server error', () => {
			expect(isConnectivityError({ code: 'functions/invalid-argument' })).toBe(false)
		})
	})

	describe('withOfflineQueue', () => {
		it('runs the online path and does not queue when it succeeds', async () => {
			const run = vi.fn().mockResolvedValue('server-uuid')
			const result = await withOfflineQueue(run, () => 'local-uuid', 'createAnimal', {})
			expect(result).toBe('server-uuid')
			expect(useOfflineQueueStore.getState().queue).toHaveLength(0)
		})

		it('queues without attempting the network call when already offline', async () => {
			setOnline(false)
			const run = vi.fn()
			const result = await withOfflineQueue(run, () => 'local-uuid', 'createAnimal', {
				animal: { animalId: '1' },
			})
			expect(run).not.toHaveBeenCalled()
			expect(result).toBe('local-uuid')
			expect(useOfflineQueueStore.getState().queue).toHaveLength(1)
			expect(useOfflineQueueStore.getState().queue[0]).toMatchObject({
				kind: 'createAnimal',
				payload: { animal: { animalId: '1' } },
				retries: 0,
			})
		})

		it('queues when the call fails with a connectivity error', async () => {
			const run = vi.fn().mockRejectedValue({ code: 'functions/unavailable' })
			const result = await withOfflineQueue(run, () => 'local-uuid', 'createAnimal', {})
			expect(result).toBe('local-uuid')
			expect(useOfflineQueueStore.getState().queue).toHaveLength(1)
		})

		it('rethrows and does not queue a real error', async () => {
			const run = vi.fn().mockRejectedValue({ code: 'functions/invalid-argument' })
			await expect(withOfflineQueue(run, () => 'local-uuid', 'createAnimal', {})).rejects.toEqual({
				code: 'functions/invalid-argument',
			})
			expect(useOfflineQueueStore.getState().queue).toHaveLength(0)
		})
	})

	describe('flushOfflineQueue', () => {
		const queryClient = { invalidateQueries: vi.fn() } as unknown as QueryClient
		const notify = vi.fn()
		const t = (key: string, opts?: Record<string, unknown>) => `${key}:${opts?.count ?? ''}`

		it('replays a queued operation, removes it, and invalidates its queries', async () => {
			useOfflineQueueStore.getState().enqueue('createAnimal', {
				animal: { animalId: '1' },
				userUuid: 'u1',
				farmUuid: 'f1',
			})
			vi.mocked(AnimalsService.setAnimal).mockResolvedValue('server-uuid')

			await flushOfflineQueue(queryClient, notify, t)

			expect(AnimalsService.setAnimal).toHaveBeenCalledWith({ animalId: '1' }, 'u1', 'f1')
			expect(useOfflineQueueStore.getState().queue).toHaveLength(0)
			expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['animals'] })
			expect(notify).toHaveBeenCalledWith('offline.syncSuccess:1', 'success')
		})

		it('stops at the first connectivity failure and keeps the item queued for retry', async () => {
			useOfflineQueueStore.getState().enqueue('createAnimal', { animal: {}, userUuid: 'u1' })
			vi.mocked(AnimalsService.setAnimal).mockRejectedValue({ code: 'functions/unavailable' })

			await flushOfflineQueue(queryClient, notify, t)

			const queue = useOfflineQueueStore.getState().queue
			expect(queue).toHaveLength(1)
			expect(queue[0]?.retries).toBe(1)
			expect(notify).not.toHaveBeenCalled()
		})

		it('drops the item and reports a failure on a real (non-connectivity) error', async () => {
			useOfflineQueueStore.getState().enqueue('createAnimal', { animal: {}, userUuid: 'u1' })
			vi.mocked(AnimalsService.setAnimal).mockRejectedValue({ code: 'functions/invalid-argument' })

			await flushOfflineQueue(queryClient, notify, t)

			expect(useOfflineQueueStore.getState().queue).toHaveLength(0)
			expect(notify).toHaveBeenCalledWith('offline.syncFailed:1', 'error')
		})

		it('does nothing while offline', async () => {
			useOfflineQueueStore.getState().enqueue('createAnimal', { animal: {}, userUuid: 'u1' })
			setOnline(false)

			await flushOfflineQueue(queryClient, notify, t)

			expect(AnimalsService.setAnimal).not.toHaveBeenCalled()
			expect(useOfflineQueueStore.getState().queue).toHaveLength(1)
		})
	})
})
