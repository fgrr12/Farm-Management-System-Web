import { useCallback, useRef, useState } from 'react'

import {
	type ExecutionResult,
	type VoiceEntityType,
	type VoiceOperations,
	type VoiceProcessingRequest,
	VoiceService,
} from '@/services/voice'

export type VoicePhase =
	| 'idle'
	| 'recording'
	| 'processing'
	| 'review'
	| 'executing'
	| 'done'
	| 'error'

export interface UseVoiceRecorderConfig {
	farmUuid: string
	userUuid: string
	maxRecordingTime?: number
	onTranscriptionComplete?: (transcription: string) => void
	onExecutionComplete?: (results: ExecutionResult[]) => void
	onError?: (error: string) => void
}

export interface UseVoiceRecorderReturn {
	phase: VoicePhase
	isRecording: boolean
	isProcessing: boolean
	isExecuting: boolean
	recordingTime: number

	startRecording: () => Promise<void>
	stopRecording: () => Promise<void>
	cancelRecording: () => void

	transcription: string | null
	/** What the AI understood, still editable (by dropping items) before it's written anywhere. */
	pendingOperations: VoiceOperations | null
	previewWarnings: string[]
	previewErrors: string[]
	discardOperation: (type: VoiceEntityType, index: number) => void
	confirmOperations: () => Promise<void>

	executionResults: ExecutionResult[]

	error: string | null
	clearError: () => void

	audioBlob: Blob | null
	audioURL: string | null

	reset: () => void
}

export const useVoiceRecorder = (config: UseVoiceRecorderConfig): UseVoiceRecorderReturn => {
	const [phase, setPhase] = useState<VoicePhase>('idle')
	const [recordingTime, setRecordingTime] = useState(0)
	const [transcription, setTranscription] = useState<string | null>(null)
	const [pendingOperations, setPendingOperations] = useState<VoiceOperations | null>(null)
	const [previewWarnings, setPreviewWarnings] = useState<string[]>([])
	const [previewErrors, setPreviewErrors] = useState<string[]>([])
	const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([])
	const [error, setError] = useState<string | null>(null)
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
	const [audioURL, setAudioURL] = useState<string | null>(null)

	const mediaRecorderRef = useRef<MediaRecorder | null>(null)
	const audioChunksRef = useRef<Blob[]>([])
	const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const streamRef = useRef<MediaStream | null>(null)
	const isCancelledRef = useRef(false)

	const clearError = useCallback(() => {
		setError(null)
		if (phase === 'error') setPhase('idle')
	}, [phase])

	const reset = useCallback(() => {
		setTranscription(null)
		setPendingOperations(null)
		setPreviewWarnings([])
		setPreviewErrors([])
		setExecutionResults([])
		setError(null)
		setAudioBlob(null)
		if (audioURL) {
			URL.revokeObjectURL(audioURL)
		}
		setAudioURL(null)
		setRecordingTime(0)
		setPhase('idle')
	}, [audioURL])

	const processAudio = useCallback(
		async (blob: Blob) => {
			try {
				setPhase('processing')
				setError(null)

				const arrayBuffer = await blob.arrayBuffer()
				const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

				const request: VoiceProcessingRequest = {
					audioData: base64,
					farmUuid: config.farmUuid,
					userUuid: config.userUuid,
					audioFormat: 'webm',
					maxDuration: config.maxRecordingTime || 60,
				}

				const response = await VoiceService.previewVoiceCommand(request)

				setTranscription(response.transcription || null)
				setPreviewWarnings(response.warnings || [])
				setPreviewErrors(response.errors || [])
				if (response.transcription) {
					config.onTranscriptionComplete?.(response.transcription)
				}

				// Nothing gets written yet — the user reviews what was understood next.
				setPendingOperations(response.data || {})
				setPhase('review')
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Failed to process audio'
				setError(errorMessage)
				setPhase('error')
				config.onError?.(errorMessage)
			}
		},
		[config]
	)

	const discardOperation = useCallback((type: VoiceEntityType, index: number) => {
		setPendingOperations((prev) => {
			if (!prev?.[type]) return prev
			return { ...prev, [type]: prev[type]!.filter((_, i) => i !== index) }
		})
	}, [])

	const confirmOperations = useCallback(async () => {
		if (!pendingOperations) return

		// Flatten in the same order they'll be sent, so the backend's aggregate
		// successCount/errors can be mapped back onto individual items for display.
		const flattened: ExecutionResult[] = []
		for (const [type, ops] of Object.entries(pendingOperations)) {
			if (!Array.isArray(ops)) continue
			for (const op of ops) {
				flattened.push({ type: type as VoiceEntityType, success: true, operation: op.operation })
			}
		}

		try {
			setPhase('executing')
			const execution = await VoiceService.executeVoiceOperations(
				pendingOperations,
				config.farmUuid,
				config.userUuid
			)

			const failedCount = flattened.length - execution.successCount
			for (let i = 0; i < failedCount && i < flattened.length; i++) {
				const idx = flattened.length - 1 - i
				flattened[idx] = { ...flattened[idx]!, success: false, error: execution.errors[i] }
			}

			setExecutionResults(flattened)
			config.onExecutionComplete?.(flattened)
			setPhase('done')
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to save the changes'
			setError(errorMessage)
			setPhase('error')
			config.onError?.(errorMessage)
		}
	}, [pendingOperations, config])

	const startRecording = useCallback(async () => {
		try {
			setError(null)
			reset()
			isCancelledRef.current = false

			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
					sampleRate: 16000,
					channelCount: 1,
				},
			})

			streamRef.current = stream

			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: 'audio/webm;codecs=opus',
				audioBitsPerSecond: 16000,
			})

			mediaRecorderRef.current = mediaRecorder
			audioChunksRef.current = []

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data)
				}
			}

			mediaRecorder.onstop = async () => {
				const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
				setAudioBlob(blob)
				setAudioURL(URL.createObjectURL(blob))

				if (streamRef.current) {
					// biome-ignore lint: kill-stream
					streamRef.current.getTracks().forEach((track) => track.stop())
					streamRef.current = null
				}

				if (!isCancelledRef.current) {
					await processAudio(blob)
				}
			}

			mediaRecorder.start(100)
			setPhase('recording')
			setRecordingTime(0)

			recordingTimerRef.current = setInterval(() => {
				setRecordingTime((prev) => {
					const newTime = prev + 1
					const maxTime = config.maxRecordingTime || 60
					if (newTime >= maxTime) {
						if (mediaRecorderRef.current?.state === 'recording') {
							mediaRecorderRef.current.stop()
						}
					}
					return newTime
				})
			}, 1000)
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to start recording'
			setError(errorMessage)
			setPhase('error')
			config.onError?.(errorMessage)
		}
	}, [config, reset, processAudio])

	const stopRecording = useCallback(async () => {
		if (!mediaRecorderRef.current || phase !== 'recording') return

		if (recordingTimerRef.current) {
			clearInterval(recordingTimerRef.current)
			recordingTimerRef.current = null
		}

		if (mediaRecorderRef.current.state === 'recording') {
			mediaRecorderRef.current.stop()
		}
	}, [phase])

	const cancelRecording = useCallback(() => {
		if (phase !== 'recording') return

		isCancelledRef.current = true

		if (recordingTimerRef.current) {
			clearInterval(recordingTimerRef.current)
			recordingTimerRef.current = null
		}

		if (mediaRecorderRef.current?.state === 'recording') {
			mediaRecorderRef.current.stop()
		}

		if (streamRef.current) {
			// biome-ignore lint: kill-stream
			streamRef.current.getTracks().forEach((track) => track.stop())
			streamRef.current = null
		}

		reset()
	}, [phase, reset])

	return {
		phase,
		isRecording: phase === 'recording',
		isProcessing: phase === 'processing',
		isExecuting: phase === 'executing',
		recordingTime,

		startRecording,
		stopRecording,
		cancelRecording,

		transcription,
		pendingOperations,
		previewWarnings,
		previewErrors,
		discardOperation,
		confirmOperations,

		executionResults,

		error,
		clearError,

		audioBlob,
		audioURL,

		reset,
	}
}
