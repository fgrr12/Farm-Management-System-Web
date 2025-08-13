import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import type { ExecutionResult, VoiceProcessingResponse } from '@/services/voice'

import { useVoiceRecorder } from '@/hooks/voice/useVoiceRecorder'

interface VoiceRecorderProps {
	className?: string
	autoExecute?: boolean
	maxRecordingTime?: number
	onTranscriptionComplete?: (transcription: string) => void
	onProcessingComplete?: (response: VoiceProcessingResponse) => void
	onExecutionComplete?: (results: ExecutionResult[]) => void
}

export function VoiceRecorder({
	className = '',
	autoExecute = false,
	maxRecordingTime = 60,
	onTranscriptionComplete,
	onProcessingComplete,
	onExecutionComplete,
}: VoiceRecorderProps) {
	const { t } = useTranslation(['voiceRecorder'])
	const { user } = useUserStore()
	const { farm } = useFarmStore()

	const {
		isRecording,
		isProcessing,
		isExecuting,
		recordingTime,
		startRecording,
		stopRecording,
		cancelRecording,
		transcription,
		processingResponse,
		executionResults,
		error,
		clearError,
		executeOperations,
		reset,
		audioURL,
	} = useVoiceRecorder({
		farmUuid: farm?.uuid || '',
		userUuid: user?.uuid || '',
		autoExecute,
		maxRecordingTime,
		onTranscriptionComplete,
		onProcessingComplete,
		onExecutionComplete,
		onError: (err) => console.error('Voice recording error:', err),
	})

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}:${secs.toString().padStart(2, '0')}`
	}

	const getRecordingButtonClass = () => {
		if (isRecording) return 'btn-error'
		if (isProcessing || isExecuting) return 'btn-disabled'
		return 'btn-primary'
	}

	const getRecordingButtonText = () => {
		if (isRecording) return t('stopRecording')
		if (isProcessing) return t('processing')
		if (isExecuting) return t('executing')
		return t('startRecording')
	}

	const handleRecordingToggle = async () => {
		if (isRecording) {
			await stopRecording()
		} else {
			await startRecording()
		}
	}

	const hasOperationsToExecute =
		processingResponse?.success &&
		processingResponse.data &&
		Object.values(processingResponse.data).some((ops) => Array.isArray(ops) && ops.length > 0)

	return (
		<div className={`card bg-base-100 shadow-xl ${className}`}>
			<div className="card-body">
				<div className="flex items-center justify-between">
					<h3 className="card-title text-lg">
						<i className="i-heroicons-microphone text-primary" />
						{t('title')}
					</h3>

					{/* Recording Timer */}
					{(isRecording || recordingTime > 0) && (
						<div className="flex items-center gap-2">
							{isRecording && <div className="w-3 h-3 bg-error rounded-full animate-pulse" />}
							<span className="font-mono text-lg">{formatTime(recordingTime)}</span>
						</div>
					)}
				</div>

				{/* Error Display */}
				{error && (
					<div className="alert alert-error">
						<i className="i-heroicons-exclamation-triangle" />
						<span>{error}</span>
						<button type="button" className="btn btn-sm btn-ghost" onClick={clearError}>
							<i className="i-heroicons-x-mark" />
						</button>
					</div>
				)}

				{/* Main Recording Controls */}
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-4">
						<button
							type="button"
							className={`btn btn-lg ${getRecordingButtonClass()}`}
							onClick={handleRecordingToggle}
							disabled={isProcessing || isExecuting || !farm || !user}
						>
							{isRecording ? (
								<i className="i-heroicons-stop text-2xl" />
							) : (
								<i className="i-heroicons-microphone text-2xl" />
							)}
							{getRecordingButtonText()}
						</button>

						{isRecording && (
							<button type="button" className="btn btn-outline btn-error" onClick={cancelRecording}>
								<i className="i-heroicons-x-mark" />
								{t('cancel')}
							</button>
						)}

						{processingResponse && !autoExecute && hasOperationsToExecute && (
							<button
								type="button"
								className="btn btn-success"
								onClick={() => executeOperations()}
								disabled={isExecuting}
							>
								<i className="i-heroicons-play" />
								{isExecuting ? t('executing') : t('execute')}
							</button>
						)}
					</div>

					{/* Progress Indicators */}
					{(isProcessing || isExecuting) && (
						<div className="flex items-center gap-2">
							<span className="loading loading-spinner loading-sm" />
							<span className="text-sm">
								{isProcessing && t('processingAudio')}
								{isExecuting && t('executingOperations')}
							</span>
						</div>
					)}
				</div>

				{/* Audio Playback */}
				{audioURL && (
					<div className="mt-4">
						<div className="text-sm font-medium mb-2">{t('recordedAudio')}</div>
						<audio controls className="w-full">
							<source src={audioURL} type="audio/webm" />
							<track kind="captions" srcLang="en" label="English captions" />
							{t('audioNotSupported')}
						</audio>
					</div>
				)}

				{/* Transcription Display */}
				{transcription && (
					<div className="mt-4">
						<div className="text-sm font-semibold mb-2">{t('transcription')}</div>
						<div className="bg-base-200 rounded-lg p-4">
							<p className="text-sm">{transcription}</p>
						</div>
					</div>
				)}

				{/* Processing Results */}
				{processingResponse && (
					<div className="mt-4">
						<div className="text-sm font-semibold mb-2">{t('aiAnalysis')}</div>

						{/* Success/Error Status */}
						<div
							className={`alert ${processingResponse.success ? 'alert-success' : 'alert-warning'} mb-2`}
						>
							<i
								className={`${processingResponse.success ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle'}`}
							/>
							<span>
								{processingResponse.success ? t('analysisSuccessful') : t('analysisWarning')}
							</span>
						</div>

						{/* Operations Summary */}
						{processingResponse.data && (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
								{Object.entries(processingResponse.data).map(([type, operations]) => {
									if (!Array.isArray(operations) || operations.length === 0) return null

									return (
										<div key={type} className="badge badge-primary gap-2">
											<i className={`i-heroicons-${getTypeIcon(type)}`} />
											{t(`operations.${type}`)}: {operations.length}
										</div>
									)
								})}
							</div>
						)}

						{/* Warnings and Errors */}
						{processingResponse.warnings && processingResponse.warnings.length > 0 && (
							<div className="collapse collapse-arrow bg-warning/10 mb-2">
								<input type="checkbox" />
								<div className="collapse-title text-sm font-medium">
									<i className="i-heroicons-exclamation-triangle text-warning mr-2" />
									{t('warnings')} ({processingResponse.warnings.length})
								</div>
								<div className="collapse-content">
									<ul className="list-disc list-inside text-sm space-y-1">
										{processingResponse.warnings.map((warning, index) => (
											<li key={index}>{warning}</li>
										))}
									</ul>
								</div>
							</div>
						)}

						{processingResponse.errors && processingResponse.errors.length > 0 && (
							<div className="collapse collapse-arrow bg-error/10 mb-2">
								<input type="checkbox" />
								<div className="collapse-title text-sm font-medium">
									<i className="i-heroicons-x-circle text-error mr-2" />
									{t('errors')} ({processingResponse.errors.length})
								</div>
								<div className="collapse-content">
									<ul className="list-disc list-inside text-sm space-y-1">
										{processingResponse.errors.map((error, index) => (
											<li key={index}>{error}</li>
										))}
									</ul>
								</div>
							</div>
						)}

						{/* Processing Stats */}
						<div className="flex justify-between text-xs text-base-content/60">
							{processingResponse.processingTime && (
								<span>
									{t('processingTime')}: {processingResponse.processingTime}ms
								</span>
							)}
							{processingResponse.tokensUsed && (
								<span>
									{t('tokensUsed')}: {processingResponse.tokensUsed}
								</span>
							)}
						</div>
					</div>
				)}

				{/* Execution Results */}
				{executionResults.length > 0 && (
					<div className="mt-4">
						<div className="text-sm font-semibold mb-2">{t('executionResults')}</div>

						<div className="space-y-2">
							{executionResults.map((result, index) => (
								<div
									key={index}
									className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}
								>
									<i
										className={`${result.success ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'}`}
									/>
									<div className="flex-1">
										<div className="font-medium">
											{t(`operations.${result.type}`)} - {result.operation}
										</div>
										{result.success && result.id && (
											<div className="text-sm opacity-75">ID: {result.id}</div>
										)}
										{!result.success && result.error && (
											<div className="text-sm">{result.error}</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Reset Button */}
				{(transcription || processingResponse || executionResults.length > 0) && (
					<div className="card-actions justify-end mt-4">
						<button type="button" className="btn btn-outline btn-sm" onClick={reset}>
							<i className="i-heroicons-arrow-path" />
							{t('reset')}
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

function getTypeIcon(type: string): string {
	switch (type) {
		case 'animals':
			return 'sparkles'
		case 'health':
			return 'heart'
		case 'production':
			return 'chart-bar'
		case 'tasks':
			return 'list-bullet'
		case 'relations':
			return 'link'
		case 'calendar':
			return 'calendar'
		default:
			return 'document'
	}
}
