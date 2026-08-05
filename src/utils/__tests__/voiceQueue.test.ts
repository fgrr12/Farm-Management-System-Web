import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useVoiceQueueStore } from '@/store/useVoiceQueueStore'

import { VoiceService } from '@/services/voice'

import { flushVoiceQueue, queueRecordingForLater } from '../voiceQueue'

vi.mock('@/services/voice', () => ({
	VoiceService: { previewVoiceCommand: vi.fn() },
}))

const setOnline = (online: boolean) => {
	Object.defineProperty(navigator, 'onLine', { value: online, configurable: true })
}

describe('voiceQueue', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		useVoiceQueueStore.setState({ pending: [], ready: [] })
		setOnline(true)
	})

	describe('queueRecordingForLater', () => {
		it('saves the recording without touching the network', () => {
			queueRecordingForLater('base64audio', 'webm', 60, 'farm-1', 'user-1')
			const { pending } = useVoiceQueueStore.getState()
			expect(pending).toHaveLength(1)
			expect(pending[0]).toMatchObject({
				audioBase64: 'base64audio',
				audioFormat: 'webm',
				farmUuid: 'farm-1',
				userUuid: 'user-1',
			})
			expect(VoiceService.previewVoiceCommand).not.toHaveBeenCalled()
		})
	})

	describe('flushVoiceQueue', () => {
		it('does nothing while offline', async () => {
			queueRecordingForLater('a', 'webm', 60, 'farm-1', 'user-1')
			setOnline(false)

			await flushVoiceQueue()

			expect(VoiceService.previewVoiceCommand).not.toHaveBeenCalled()
			expect(useVoiceQueueStore.getState().pending).toHaveLength(1)
		})

		it('moves a successfully interpreted recording from pending to ready', async () => {
			queueRecordingForLater('a', 'webm', 60, 'farm-1', 'user-1')
			vi.mocked(VoiceService.previewVoiceCommand).mockResolvedValue({
				success: true,
				transcription: 'vacuné a la 12',
				data: { health: [{ operation: 'create', animalUuid: 'x', data: {} }] },
				warnings: [],
				errors: [],
			})

			const notify = vi.fn()
			const t = (key: string, opts?: Record<string, unknown>) => `${key}:${opts?.count}`
			await flushVoiceQueue(notify, t)

			const state = useVoiceQueueStore.getState()
			expect(state.pending).toHaveLength(0)
			expect(state.ready).toHaveLength(1)
			expect(state.ready[0]?.transcription).toBe('vacuné a la 12')
			expect(notify).toHaveBeenCalledWith('offline.voiceReady:1', 'success')
		})

		it('stops at the first connectivity failure, keeping the recording queued', async () => {
			queueRecordingForLater('a', 'webm', 60, 'farm-1', 'user-1')
			vi.mocked(VoiceService.previewVoiceCommand).mockRejectedValue({
				code: 'functions/unavailable',
			})

			await flushVoiceQueue()

			expect(useVoiceQueueStore.getState().pending).toHaveLength(1)
			expect(useVoiceQueueStore.getState().ready).toHaveLength(0)
		})

		it('surfaces a real processing failure instead of retrying it forever', async () => {
			queueRecordingForLater('a', 'webm', 60, 'farm-1', 'user-1')
			vi.mocked(VoiceService.previewVoiceCommand).mockRejectedValue(new Error('No speech detected'))

			await flushVoiceQueue()

			const state = useVoiceQueueStore.getState()
			expect(state.pending).toHaveLength(0)
			expect(state.ready).toHaveLength(1)
			expect(state.ready[0]?.errors).toEqual(['No speech detected'])
		})
	})
})
