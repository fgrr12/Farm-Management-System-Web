import { useVoiceQueueStore } from '@/store/useVoiceQueueStore'

import { type VoiceProcessingRequest, VoiceService } from '@/services/voice'

import { isConnectivityError } from './offlineQueue'

/** Saves a recording made without a connection — it'll be transcribed and interpreted
 *  automatically once the connection is back (see flushVoiceQueue), no need to re-record it. */
export const queueRecordingForLater = (
	audioBase64: string,
	audioFormat: 'webm' | 'mp3' | 'wav',
	maxDuration: number,
	farmUuid: string,
	userUuid: string
): void => {
	useVoiceQueueStore
		.getState()
		.enqueuePending({ audioBase64, audioFormat, maxDuration, farmUuid, userUuid })
}

let isFlushingVoiceQueue = false

/**
 * Transcribes and interprets every queued recording, in order — but never executes anything;
 * each one just moves from "pending" (raw audio) to "ready" (parsed, waiting for the user to
 * review). Stops at the first connectivity failure so a flaky reconnect retries later instead
 * of dropping recordings out of order. A recording that fails for a real reason (e.g. no
 * speech detected) still moves to "ready" with its error attached, so it surfaces to the user
 * instead of vanishing.
 */
export const flushVoiceQueue = async (
	notify?: (message: string, type: 'success' | 'error') => void,
	t?: (key: string, opts?: Record<string, unknown>) => string
): Promise<void> => {
	if (isFlushingVoiceQueue) return
	if (typeof navigator !== 'undefined' && !navigator.onLine) return

	const items = useVoiceQueueStore.getState().pending
	if (items.length === 0) return

	isFlushingVoiceQueue = true
	let readyCount = 0

	try {
		for (const item of items) {
			const request: VoiceProcessingRequest = {
				audioData: item.audioBase64,
				farmUuid: item.farmUuid,
				userUuid: item.userUuid,
				audioFormat: item.audioFormat,
				maxDuration: item.maxDuration,
			}

			try {
				const response = await VoiceService.previewVoiceCommand(request)
				useVoiceQueueStore.getState().dequeuePending(item.id)
				useVoiceQueueStore.getState().enqueueReady({
					transcription: response.transcription || null,
					operations: response.data || {},
					warnings: response.warnings || [],
					errors: response.errors || [],
					farmUuid: item.farmUuid,
					userUuid: item.userUuid,
				})
				readyCount++
			} catch (error) {
				if (isConnectivityError(error)) break
				useVoiceQueueStore.getState().dequeuePending(item.id)
				useVoiceQueueStore.getState().enqueueReady({
					transcription: null,
					operations: {},
					warnings: [],
					errors: [error instanceof Error ? error.message : 'Failed to process the recording'],
					farmUuid: item.farmUuid,
					userUuid: item.userUuid,
				})
				readyCount++
			}
		}
	} finally {
		isFlushingVoiceQueue = false
	}

	if (readyCount > 0 && notify && t) {
		notify(t('offline.voiceReady', { count: readyCount }), 'success')
	}
}
