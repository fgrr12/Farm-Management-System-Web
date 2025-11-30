import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import type { ExecutionResult, VoiceProcessingResponse } from '@/services/voice'

import { useVoiceRecorder } from '@/hooks/voice/useVoiceRecorder'

interface VoiceRecorderProps {
	className?: string
	maxRecordingTime?: number
	onTranscriptionComplete?: (transcription: string) => void
	onProcessingComplete?: (response: VoiceProcessingResponse) => void
	onExecutionComplete?: (results: ExecutionResult[]) => void
}

export function VoiceRecorder({
	className = '',
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
		recordingTime,
		startRecording,
		stopRecording,
		cancelRecording,
		transcription,
		processingResponse,
		executionResults,
		error,
		clearError,
		reset,
		audioURL,
	} = useVoiceRecorder({
		farmUuid: farm?.uuid || '',
		userUuid: user?.uuid || '',
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

	const handleRecordingToggle = async () => {
		if (isRecording) {
			await stopRecording()
		} else {
			await startRecording()
		}
	}

	const getCurrentState = () => {
		if (executionResults.length > 0) return 'done'
		if (isProcessing) return 'processing'
		if (isRecording) return 'recording'
		return 'ready'
	}

	const currentState = getCurrentState()

	// Get background color based on state
	const getBackgroundClass = () => {
		switch (currentState) {
			case 'recording':
				return 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700'
			case 'processing':
				return 'bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700'
			case 'done':
				return 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700'
			default:
				return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
		}
	}

	// Get status message
	const getStatusMessage = () => {
		switch (currentState) {
			case 'recording':
				return t('recordingInProgress')
			case 'processing':
				return t('processingYourCommand')
			case 'done':
				return t('done')
			default:
				return t('readyToRecord')
		}
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Error Display */}
			{error && (
				<div className="alert alert-error shadow-lg animate-in slide-in-from-top-2 duration-300">
					<div className="flex items-center gap-3">
						<i className="i-heroicons-exclamation-triangle text-xl" />
						<span className="flex-1">{error}</span>
						<button
							type="button"
							className="btn btn-sm btn-ghost hover:btn-error transition-colors"
							onClick={clearError}
						>
							<i className="i-heroicons-x-mark" />
						</button>
					</div>
				</div>
			)}

			{/* Main Recording Card */}
			<div
				className={`card shadow-2xl border-4 transition-all duration-500 ${getBackgroundClass()}`}
			>
				<div className="card-body p-8 sm:p-12">
					{/* Status Message - Large and Prominent */}
					<div className="text-center mb-8">
						<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
							{getStatusMessage()}
						</h2>
						{isRecording && (
							<p className="text-xl text-gray-600 dark:text-gray-400 animate-pulse">
								{t('listening')}
							</p>
						)}
					</div>

					{/* Giant Recording Button */}
					<div className="flex flex-col items-center gap-6 mb-8">
						<button
							type="button"
							onClick={handleRecordingToggle}
							disabled={isProcessing || !farm || !user}
							className={`
								relative w-48 h-48 sm:w-64 sm:h-64 rounded-full 
								transition-all duration-300 transform
								${
									isRecording
										? 'bg-red-500 hover:bg-red-600 scale-110 shadow-2xl shadow-red-500/50'
										: isProcessing
											? 'bg-gray-400 cursor-not-allowed'
											: 'bg-linear-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 hover:scale-105 shadow-2xl hover:shadow-pink-500/50'
								}
								${!isRecording && !isProcessing ? 'animate-pulse' : ''}
								disabled:opacity-50 disabled:cursor-not-allowed
								focus:outline-none focus:ring-8 focus:ring-pink-300 dark:focus:ring-pink-800
							`}
						>
							{/* Icon */}
							<div className="absolute inset-0 flex items-center justify-center">
								{isRecording ? (
									<div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-lg animate-pulse" />
								) : isProcessing ? (
									<div className="loading loading-spinner loading-lg text-white w-20 h-20 sm:w-24 sm:h-24" />
								) : (
									<i className="i-heroicons-microphone text-white text-8xl sm:text-9xl drop-shadow-lg" />
								)}
							</div>

							{/* Pulse animation when ready */}
							{!isRecording && !isProcessing && (
								<span className="absolute inset-0 rounded-full bg-pink-400 animate-ping opacity-75" />
							)}
						</button>

						{/* Button Label */}
						<div className="text-center">
							<p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
								{isRecording
									? t('stopRecording')
									: isProcessing
										? t('processing')
										: t('pressToSpeak')}
							</p>
						</div>

						{/* Recording Timer - Extra Large */}
						{(isRecording || recordingTime > 0) && (
							<div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-3 duration-300">
								<div className="text-6xl sm:text-7xl font-mono font-bold text-red-600 dark:text-red-400 tabular-nums">
									{formatTime(recordingTime)}
								</div>
								<div className="text-xl text-gray-500 dark:text-gray-400">
									/ {formatTime(maxRecordingTime)}
								</div>
								{/* Progress bar */}
								<div className="w-64 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
									<div
										className="h-full bg-red-500 transition-all duration-1000"
										style={{ width: `${(recordingTime / maxRecordingTime) * 100}%` }}
									/>
								</div>
							</div>
						)}

						{/* Cancel Button (only when recording) */}
						{isRecording && (
							<button
								type="button"
								className="btn btn-lg btn-outline btn-error hover:btn-error transition-all duration-300 animate-in slide-in-from-bottom-3"
								onClick={cancelRecording}
							>
								<i className="i-heroicons-x-mark text-xl" />
								<span className="text-xl">{t('cancel')}</span>
							</button>
						)}
					</div>

					{/* Processing Indicator */}
					{isProcessing && (
						<div className="bg-blue-100 dark:bg-blue-900/30 rounded-2xl p-6 border-2 border-blue-300 dark:border-blue-700 animate-in slide-in-from-bottom-3 duration-500">
							<div className="flex flex-col items-center gap-4 text-center">
								<div className="loading loading-spinner loading-lg text-blue-600" />
								<div>
									<p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
										{t('status.processingVoiceCommand')}
									</p>
									<p className="text-lg text-blue-700 dark:text-blue-300">
										{t('status.aiAnalyzing')}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Results Section */}
			{(transcription || processingResponse || executionResults.length > 0 || audioURL) && (
				<div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
					{/* Audio Playback */}
					{audioURL && (
						<div className="card bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
							<div className="card-body p-4">
								<div className="flex items-center gap-3 mb-3">
									<i className="i-heroicons-musical-note text-primary text-lg" />
									<span className="font-medium text-gray-900 dark:text-gray-100">
										{t('recordedAudio')}
									</span>
								</div>
								<audio controls className="w-full">
									<source src={audioURL} type="audio/webm" />
									<track kind="captions" srcLang="en" label="English captions" />
									{t('audioNotSupported')}
								</audio>
							</div>
						</div>
					)}

					{/* Transcription */}
					{transcription && (
						<div className="card bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg border border-blue-200 dark:border-blue-700">
							<div className="card-body p-4">
								<div className="flex items-center gap-3 mb-3">
									<i className="i-heroicons-microphone text-blue-600 text-lg" />
									<span className="font-semibold text-blue-900 dark:text-blue-100">
										{t('transcription')}
									</span>
								</div>
								<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-600">
									<p className="text-lg text-gray-700 dark:text-gray-300 italic">
										"{transcription}"
									</p>
								</div>
							</div>
						</div>
					)}

					{/* AI Analysis Results */}
					{processingResponse && (
						<div className="card bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg border border-purple-200 dark:border-purple-700">
							<div className="card-body p-4">
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3">
										<i className="i-heroicons-cpu-chip text-purple-600 text-lg" />
										<span className="font-semibold text-purple-900 dark:text-purple-100">
											{t('aiAnalysis')}
										</span>
									</div>
									<div
										className={`badge ${processingResponse.success ? 'badge-success' : 'badge-warning'} shadow-sm`}
									>
										{processingResponse.success ? t('analysisSuccessful') : t('analysisWarning')}
									</div>
								</div>
								{/* Operations Summary */}
								{processingResponse.data && (
									<div className="mb-4">
										<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
											{t('status.operationsDetected')}:
										</p>
										<div className="flex flex-wrap gap-2">
											{Object.entries(processingResponse.data).map(([type, operations]) => {
												if (!Array.isArray(operations) || operations.length === 0) return null

												const iconName = (() => {
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
												})()

												return (
													<div
														key={type}
														className="badge badge-primary gap-2 shadow-sm hover:shadow-md transition-shadow"
													>
														<i className={`i-heroicons-${iconName}`} />
														{t(`operations.${type}`)}: {operations.length}
													</div>
												)
											})}
										</div>
									</div>
								)}{' '}
								{/* Warnings */}
								{processingResponse.warnings && processingResponse.warnings.length > 0 && (
									<div className="mb-4">
										<div className="collapse collapse-arrow bg-warning/10 border border-warning/20">
											<input type="checkbox" />
											<div className="collapse-title text-sm font-medium flex items-center gap-2">
												<i className="i-heroicons-exclamation-triangle text-warning" />
												{t('warnings')} ({processingResponse.warnings.length})
											</div>
											<div className="collapse-content">
												<ul className="list-disc list-inside text-sm space-y-1 text-warning">
													{processingResponse.warnings.map((warning, index) => (
														<li key={index}>{warning}</li>
													))}
												</ul>
											</div>
										</div>
									</div>
								)}
								{/* Errors */}
								{processingResponse.errors && processingResponse.errors.length > 0 && (
									<div className="mb-4">
										<div className="collapse collapse-arrow bg-error/10 border border-error/20">
											<input type="checkbox" />
											<div className="collapse-title text-sm font-medium flex items-center gap-2">
												<i className="i-heroicons-x-circle text-error" />
												{t('errors')} ({processingResponse.errors.length})
											</div>
											<div className="collapse-content">
												<ul className="list-disc list-inside text-sm space-y-1 text-error">
													{processingResponse.errors.map((error, index) => (
														<li key={index}>{error}</li>
													))}
												</ul>
											</div>
										</div>
									</div>
								)}
								{/* Processing Stats */}
								{(processingResponse.processingTime || processingResponse.tokensUsed) && (
									<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-purple-200 dark:border-purple-700">
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
								)}
							</div>
						</div>
					)}

					{/* Execution Results */}
					{executionResults.length > 0 && (
						<div className="card bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg border border-green-200 dark:border-green-700">
							<div className="card-body p-4">
								<div className="flex items-center gap-3 mb-4">
									<i className="i-heroicons-check-circle text-green-600 text-lg" />
									<span className="font-semibold text-green-900 dark:text-green-100">
										{t('executionResults')} ({executionResults.length})
									</span>
								</div>

								<div className="space-y-3">
									{executionResults.map((result, index) => (
										<div
											key={index}
											className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${
												result.success
													? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
													: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
											}`}
										>
											<div className="flex items-start gap-3">
												<i
													className={`${
														result.success
															? 'i-heroicons-check-circle text-green-600'
															: 'i-heroicons-x-circle text-red-600'
													} text-lg mt-0.5 shrink-0`}
												/>
												<div className="flex-1">
													<div className="font-medium text-gray-900 dark:text-gray-100">
														{t(`operations.${result.type}`)} - {result.operation}
													</div>
													{result.success && result.id && (
														<div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono">
															ID: {result.id}
														</div>
													)}
													{!result.success && result.error && (
														<div className="text-sm text-red-600 dark:text-red-400 mt-1">
															{result.error}
														</div>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Reset Button */}
					<div className="flex justify-center">
						<button
							type="button"
							className="btn btn-lg btn-primary gap-2 shadow-lg transition-all duration-300 transform hover:scale-105"
							onClick={reset}
						>
							<i className="i-heroicons-arrow-path text-xl" />
							<span className="text-lg">{t('reset')}</span>
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
