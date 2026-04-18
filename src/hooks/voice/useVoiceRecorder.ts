import { useCallback, useRef, useState } from 'react'

import {
	type ExecutionResult,
	type VoiceProcessingRequest,
	type VoiceProcessingResponse,
	VoiceService,
} from '@/services/voice'

export type VoicePhase = 'idle' | 'recording' | 'processing' | 'done' | 'error'

export interface UseVoiceRecorderConfig {
	farmUuid: string
	userUuid: string
	maxRecordingTime?: number
	onTranscriptionComplete?: (transcription: string) => void
	onProcessingComplete?: (response: VoiceProcessingResponse) => void
	onExecutionComplete?: (results: ExecutionResult[]) => void
	onError?: (error: string) => void
}

export interface UseVoiceRecorderReturn {
	phase: VoicePhase
	isRecording: boolean
	isProcessing: boolean
	recordingTime: number

	startRecording: () => Promise<void>
	stopRecording: () => Promise<void>
	cancelRecording: () => void

	transcription: string | null
	processingResponse: VoiceProcessingResponse | null
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
	const [processingResponse, setProcessingResponse] = useState<VoiceProcessingResponse | null>(null)
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
		setProcessingResponse(null)
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

				const response = await VoiceService.processAndExecuteVoiceCommand(request)

				if (!response || !response.data) {
					throw new Error('Invalid response from voice processing service')
				}

				const extractionResult = response.data

				setTranscription(extractionResult.transcription || null)
				setProcessingResponse(extractionResult)

				if (extractionResult.transcription) {
					config.onTranscriptionComplete?.(extractionResult.transcription)
				}
				config.onProcessingComplete?.(extractionResult)

				// Build execution results with proper type mapping from response data
				const results: ExecutionResult[] = []
				if (extractionResult.data) {
					for (const [type, operations] of Object.entries(extractionResult.data)) {
						if (!Array.isArray(operations)) continue
						for (const op of operations) {
							results.push({
								type: type as ExecutionResult['type'],
								success: true,
								operation: op.operation || 'create',
							})
						}
					}
				}

				// Cross-reference execution results to mark failures
				const execution = extractionResult.execution
				if (execution) {
					const executionErrors = execution.errors ?? []

					if (results.length > 0) {
						const failedCount = results.length - (execution.successCount ?? results.length)
						if (failedCount > 0) {
							for (let i = 0; i < failedCount && i < results.length; i++) {
								const idx = results.length - 1 - i
								results[idx].success = false
								results[idx].error = executionErrors[i] || undefined
							}
						}
						// Append extra errors not mapped to an operation
						const mappedCount = Math.min(
							Math.max(results.length - (execution.successCount ?? results.length), 0),
							results.length
						)
						for (let i = mappedCount; i < executionErrors.length; i++) {
							results.push({
								type: 'animal',
								success: false,
								error: executionErrors[i],
								operation: 'unknown',
							})
						}
					} else {
						// No operations parsed from AI data — show each error as standalone
						for (const err of executionErrors) {
							results.push({
								type: 'animal',
								success: false,
								error: err,
								operation: 'create',
							})
						}
					}
				}

				setExecutionResults(results)
				config.onExecutionComplete?.(results)
				setPhase('done')
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Failed to process audio'
				setError(errorMessage)
				setPhase('error')
				config.onError?.(errorMessage)
			}
		},
		[config]
	)

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
		recordingTime,

		startRecording,
		stopRecording,
		cancelRecording,

		transcription,
		processingResponse,
		executionResults,

		error,
		clearError,

		audioBlob,
		audioURL,

		reset,
	}
}
