import { callableFireFunction } from '@/utils/callableFireFunction'

// Voice processing interfaces

export interface VoiceProcessingRequest {
	audioData: string // Base64 encoded audio
	farmUuid: string
	userUuid: string
	audioFormat?: 'webm' | 'mp3' | 'wav'
	maxDuration?: number
}

/**
 * One parsed action extracted from a voice command. `data` is intentionally loosely typed —
 * its exact shape depends on `entityType` and is defined (and re-validated) server-side in
 * voice.schemas.ts; the frontend only needs to display it and pass it back unmodified (or with
 * the whole entry dropped) when the user confirms.
 */
export interface VoiceOperation {
	operation: 'create' | 'update'
	animalUuid?: string | null
	data: Record<string, any>
	updateAnimalHealthStatus?: string | null
}

export type VoiceEntityType =
	| 'animals'
	| 'health'
	| 'production'
	| 'tasks'
	| 'relations'
	| 'calendar'

export type VoiceOperations = Partial<Record<VoiceEntityType, VoiceOperation[]>>

export interface VoiceProcessingResponse {
	success: boolean
	transcription?: string | null
	data?: VoiceOperations | null
	errors?: string[] | null
	warnings?: string[] | null
	unprocessed?: string[] | null
	processingTime?: number | null
}

export interface ExecutionResult {
	type: VoiceEntityType
	success: boolean
	id?: string
	error?: string
	operation?: string
}

export interface VoiceExecutionResponse {
	success: boolean
	errors: string[]
	successCount: number
}

/**
 * Transcribes and interprets a voice command WITHOUT writing anything — the caller shows the
 * parsed operations to the user for review, then calls executeVoiceOperations only once
 * they've confirmed (see VoiceCommandModal's review step).
 */
const previewVoiceCommand = async (
	request: VoiceProcessingRequest
): Promise<VoiceProcessingResponse> => {
	const response = await callableFireFunction<{ success: boolean; data: VoiceProcessingResponse }>(
		'voice',
		{ operation: 'previewVoiceCommand', ...request }
	)
	return response.data
}

/**
 * Applies operations the user has already reviewed (and possibly trimmed).
 */
const executeVoiceOperations = async (
	operations: VoiceOperations,
	farmUuid: string,
	userUuid: string
): Promise<VoiceExecutionResponse> => {
	const response = await callableFireFunction<{ success: boolean; data: VoiceExecutionResponse }>(
		'voice',
		{ operation: 'executeVoiceOperations', operations, farmUuid, userUuid }
	)
	return response.data
}

export const VoiceService = {
	previewVoiceCommand,
	executeVoiceOperations,
}
