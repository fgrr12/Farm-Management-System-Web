import type { VoiceOperations } from '@/services/voice'

/** A recording made offline, waiting for a connection to be transcribed and interpreted. */
export interface QueuedRecording {
	id: string
	audioBase64: string
	audioFormat: 'webm' | 'mp3' | 'wav'
	maxDuration: number
	farmUuid: string
	userUuid: string
	createdAt: number
}

/** A recording that's already been transcribed and interpreted, waiting for the user to
 *  review and confirm it — nothing here has been written anywhere yet. */
export interface ReviewableVoiceCommand {
	id: string
	transcription: string | null
	operations: VoiceOperations
	warnings: string[]
	errors: string[]
	farmUuid: string
	userUuid: string
	createdAt: number
}

export type VoiceQueueStore = {
	pending: QueuedRecording[]
	ready: ReviewableVoiceCommand[]
	enqueuePending: (recording: Omit<QueuedRecording, 'id' | 'createdAt'>) => void
	dequeuePending: (id: string) => void
	enqueueReady: (command: Omit<ReviewableVoiceCommand, 'id' | 'createdAt'>) => void
	dequeueReady: (id: string) => void
}
