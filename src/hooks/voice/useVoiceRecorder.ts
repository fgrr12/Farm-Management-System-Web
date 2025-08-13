import { useCallback, useRef, useState } from 'react'

import type {
	ExecutionResult,
	VoiceProcessingRequest,
	VoiceProcessingResponse,
} from '@/services/voice'

export interface UseVoiceRecorderConfig {
	farmUuid: string
	userUuid: string
	autoExecute?: boolean
	maxRecordingTime?: number
	onTranscriptionComplete?: (transcription: string) => void
	onProcessingComplete?: (response: VoiceProcessingResponse) => void
	onExecutionComplete?: (results: ExecutionResult[]) => void
	onError?: (error: string) => void
}

export interface UseVoiceRecorderReturn {
	// Recording state
	isRecording: boolean
	isProcessing: boolean
	isExecuting: boolean
	recordingTime: number

	// Audio management
	startRecording: () => Promise<void>
	stopRecording: () => Promise<void>
	cancelRecording: () => void

	// Results
	transcription: string | null
	processingResponse: VoiceProcessingResponse | null
	executionResults: ExecutionResult[]

	// Error handling
	error: string | null
	clearError: () => void

	// Audio data
	audioBlob: Blob | null
	audioURL: string | null

	// Manual execution
	executeOperations: () => Promise<void>

	// Reset state
	reset: () => void
}

export const useVoiceRecorder = (config: UseVoiceRecorderConfig): UseVoiceRecorderReturn => {
	const [isRecording, setIsRecording] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)
	const [isExecuting, setIsExecuting] = useState(false)
	const [recordingTime, setRecordingTime] = useState(0)
	const [transcription, setTranscription] = useState<string | null>(null)
	const [processingResponse, setProcessingResponse] = useState<VoiceProcessingResponse | null>(null)
	const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([])
	const [error, setError] = useState<string | null>(null)
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
	const [audioURL, setAudioURL] = useState<string | null>(null)

	const mediaRecorderRef = useRef<MediaRecorder | null>(null)
	const audioChunksRef = useRef<Blob[]>([])
	const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
	const streamRef = useRef<MediaStream | null>(null)

	const clearError = useCallback(() => {
		setError(null)
	}, [])

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
	}, [audioURL])

	const executeOperations = useCallback(
		async (response?: VoiceProcessingResponse) => {
			const responseToUse = response || processingResponse
			if (!responseToUse?.data) {
				setError('No operations to execute')
				return
			}

			try {
				setIsExecuting(true)
				clearError()

				// Import service dynamically
				const { VoiceService } = await import('@/services/voice')

				// Execute operations
				const results = await VoiceService.executeOperations(
					responseToUse,
					config.farmUuid,
					config.userUuid
				)

				setExecutionResults(results)
				config.onExecutionComplete?.(results)
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Failed to execute operations'
				setError(errorMessage)
				config.onError?.(errorMessage)
			} finally {
				setIsExecuting(false)
			}
		},
		[processingResponse, config, clearError]
	)

	const processAudio = useCallback(
		async (blob: Blob) => {
			try {
				setIsProcessing(true)
				clearError()

				// Convert blob to base64
				const arrayBuffer = await blob.arrayBuffer()
				const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

				// Import service dynamically
				const { VoiceService } = await import('@/services/voice')

				// Create request
				const request: VoiceProcessingRequest = {
					audioData: base64,
					farmUuid: config.farmUuid,
					userUuid: config.userUuid,
					audioFormat: 'webm',
					maxDuration: config.maxRecordingTime || 60, // Default to 60 seconds
				}

				// Process voice command
				const response = await VoiceService.processVoiceCommand(request)

				setTranscription(response.transcription || null)
				setProcessingResponse(response)

				// Trigger callbacks
				if (response.transcription) {
					config.onTranscriptionComplete?.(response.transcription)
				}
				config.onProcessingComplete?.(response)

				// Auto-execute if configured
				if (config.autoExecute && response.success && response.data) {
					await executeOperations(response)
				}
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Failed to process audio'
				setError(errorMessage)
				config.onError?.(errorMessage)
			} finally {
				setIsProcessing(false)
			}
		},
		[config, clearError, executeOperations]
	)

	const startRecording = useCallback(async () => {
		try {
			clearError()
			reset()

			// Request microphone access with optimized settings for compression
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
					sampleRate: 16000, // Reduced from default 44.1kHz
					channelCount: 1, // Mono instead of stereo
				},
			})

			streamRef.current = stream

			// Create MediaRecorder with aggressive compression settings
			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: 'audio/webm;codecs=opus',
				audioBitsPerSecond: 16000, // 16kbps instead of default 128kbps = 87.5% reduction
			})

			mediaRecorderRef.current = mediaRecorder
			audioChunksRef.current = []

			// Event handlers
			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data)
				}
			}

			mediaRecorder.onstop = async () => {
				const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
				setAudioBlob(blob)
				setAudioURL(URL.createObjectURL(blob))

				// Stop all tracks
				if (streamRef.current) {
					streamRef.current.getTracks().forEach((track) => track.stop())
					streamRef.current = null
				}

				// Process the audio
				await processAudio(blob)
			}

			// Start recording
			mediaRecorder.start(100) // Collect data every 100ms
			setIsRecording(true)
			setRecordingTime(0)

			// Start timer
			recordingTimerRef.current = setInterval(() => {
				setRecordingTime((prev) => {
					const newTime = prev + 1
					const maxTime = config.maxRecordingTime || 60 // Default to 60 seconds
					// Auto-stop if max time reached
					if (newTime >= maxTime) {
						// Stop recording when max time reached
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
			config.onError?.(errorMessage)
		}
	}, [config, clearError, reset, processAudio])

	const stopRecording = useCallback(async () => {
		if (!mediaRecorderRef.current || !isRecording) return

		// Clear timer
		if (recordingTimerRef.current) {
			clearInterval(recordingTimerRef.current)
			recordingTimerRef.current = null
		}

		setIsRecording(false)

		// Stop recording
		if (mediaRecorderRef.current.state === 'recording') {
			mediaRecorderRef.current.stop()
		}
	}, [isRecording])

	const cancelRecording = useCallback(() => {
		if (!isRecording) return

		// Clear timer
		if (recordingTimerRef.current) {
			clearInterval(recordingTimerRef.current)
			recordingTimerRef.current = null
		}

		setIsRecording(false)

		// Stop recording without processing
		if (mediaRecorderRef.current?.state === 'recording') {
			mediaRecorderRef.current.stop()
		}

		// Stop all tracks
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop())
			streamRef.current = null
		}

		reset()
	}, [isRecording, reset])

	return {
		// Recording state
		isRecording,
		isProcessing,
		isExecuting,
		recordingTime,

		// Audio management
		startRecording,
		stopRecording,
		cancelRecording,

		// Results
		transcription,
		processingResponse,
		executionResults,

		// Error handling
		error,
		clearError,

		// Audio data
		audioBlob,
		audioURL,

		// Manual execution
		executeOperations,

		// Reset state
		reset,
	}
}
