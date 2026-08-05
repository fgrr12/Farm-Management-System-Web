import type { QueryClient } from '@tanstack/react-query'

import type { OfflineQueueKind } from '@/store/useOfflineQueueStore'
import { useOfflineQueueStore } from '@/store/useOfflineQueueStore'

import { AnimalsService } from '@/services/animals'
import { HealthRecordsService } from '@/services/healthRecords'
import { ProductionRecordsService } from '@/services/productionRecords'

/**
 * Firebase httpsCallable surfaces connectivity problems as these codes (or, before the SDK
 * wraps them, as a plain fetch TypeError). Anything else is a real error (validation,
 * permission, etc.) and must not be silently queued and retried.
 */
export const isConnectivityError = (error: unknown): boolean => {
	if (typeof navigator !== 'undefined' && !navigator.onLine) return true
	const code = (error as { code?: string } | undefined)?.code
	if (code === 'functions/unavailable' || code === 'functions/deadline-exceeded') return true
	return error instanceof TypeError
}

/**
 * Runs `run`. If it fails because of connectivity (or there's no connectivity to begin with),
 * the operation is queued for later instead of being lost, and `queuedResult()` is returned so
 * callers (react-query mutations) can resolve as if the write had gone through — the entity
 * already lives in the optimistic cache, it's just not on the server yet.
 */
export const withOfflineQueue = async <T>(
	run: () => Promise<T>,
	queuedResult: () => T,
	kind: OfflineQueueKind,
	payload: Record<string, any>
): Promise<T> => {
	if (typeof navigator !== 'undefined' && !navigator.onLine) {
		useOfflineQueueStore.getState().enqueue(kind, payload)
		return queuedResult()
	}
	try {
		return await run()
	} catch (error) {
		if (!isConnectivityError(error)) throw error
		useOfflineQueueStore.getState().enqueue(kind, payload)
		return queuedResult()
	}
}

const REPLAYERS: Record<OfflineQueueKind, (payload: any) => Promise<unknown>> = {
	createAnimal: (p) => AnimalsService.setAnimal(p.animal, p.userUuid, p.farmUuid),
	updateAnimal: (p) => AnimalsService.updateAnimal(p.animal, p.userUuid),
	createHealthRecord: (p) =>
		HealthRecordsService.setHealthRecord(p.healthRecord, p.userUuid, p.farmUuid),
	updateHealthRecord: (p) =>
		HealthRecordsService.updateHealthRecord(p.healthRecord, p.userUuid, p.farmUuid),
	createProductionRecord: (p) =>
		ProductionRecordsService.setProductionRecord(p.productionRecord, p.userUuid, p.farmUuid),
	updateProductionRecord: (p) =>
		ProductionRecordsService.updateProductionRecord(p.productionRecord, p.userUuid, p.farmUuid),
}

const INVALIDATE_PREFIX: Record<OfflineQueueKind, string[]> = {
	createAnimal: ['animals'],
	updateAnimal: ['animals'],
	createHealthRecord: ['healthRecords', 'animals'],
	updateHealthRecord: ['healthRecords', 'animals'],
	createProductionRecord: ['productionRecords'],
	updateProductionRecord: ['productionRecords'],
}

let isFlushing = false

/**
 * Replays every queued operation, in order, against the real backend. Stops at the first
 * connectivity failure (the retry will pick up where it left off) so a flaky reconnect doesn't
 * burn through the whole queue out of order. A non-connectivity failure means the operation
 * itself is invalid (e.g. the animal it referenced was deleted meanwhile) — it's dropped and
 * reported instead of retried forever.
 */
export const flushOfflineQueue = async (
	queryClient: QueryClient,
	notify: (message: string, type: 'success' | 'error') => void,
	t: (key: string, opts?: Record<string, unknown>) => string
): Promise<void> => {
	if (isFlushing) return
	if (typeof navigator !== 'undefined' && !navigator.onLine) return

	const items = useOfflineQueueStore.getState().queue
	if (items.length === 0) return

	isFlushing = true
	let synced = 0
	let failed = 0

	try {
		for (const item of items) {
			try {
				await REPLAYERS[item.kind](item.payload)
				useOfflineQueueStore.getState().dequeue(item.id)
				for (const prefix of INVALIDATE_PREFIX[item.kind]) {
					queryClient.invalidateQueries({ queryKey: [prefix] })
				}
				synced++
			} catch (error) {
				if (isConnectivityError(error)) {
					useOfflineQueueStore.getState().bumpRetry(item.id)
					break
				}
				useOfflineQueueStore.getState().dequeue(item.id)
				failed++
			}
		}
	} finally {
		isFlushing = false
	}

	if (synced > 0) notify(t('offline.syncSuccess', { count: synced }), 'success')
	if (failed > 0) notify(t('offline.syncFailed', { count: failed }), 'error')
}
