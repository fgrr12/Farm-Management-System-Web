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

	const getRecordingButtonClass = () => {
		if (isRecording) return 'btn-error hover:btn-error focus:btn-error'
		if (isProcessing) return 'btn-disabled'
		return 'btn-primary hover:btn-primary focus:btn-primary'
	}

	const getRecordingButtonText = () => {
		if (isRecording) return t('stopRecording')
		if (isProcessing) return t('processing')
		return t('startRecording')
	}

	const handleRecordingToggle = async () => {
		if (isRecording) {
			await stopRecording()
		} else {
			await startRecording()
		}
	}

	const getProgressStep = () => {
		if (executionResults.length > 0) return 3
		if (isProcessing) return 2
		if (isRecording) return 1
		return 0
	}

	const progressStep = getProgressStep()

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
			<div className="card bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
				<div className="card-body p-6 sm:p-8">
					{/* Header with Progress */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
								<i className="i-heroicons-microphone text-white text-xl" />
							</div>
							<div>
								<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{t('mode.automatic')}
								</p>
							</div>
						</div>

						{/* Recording Timer */}
						{(isRecording || recordingTime > 0) && (
							<div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 animate-in slide-in-from-right-3 duration-300">
								{isRecording && (
									<div className="w-3 h-3 bg-error rounded-full animate-pulse shadow-lg" />
								)}
								<span className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">
									{formatTime(recordingTime)}
								</span>
								<span className="text-xs text-gray-500 dark:text-gray-400">
									/ {formatTime(maxRecordingTime)}
								</span>
							</div>
						)}
					</div>

					{/* Progress Steps */}
					<div className="mb-8">
						<div className="flex items-center justify-between">
							{[t('steps.record'), t('steps.process'), t('steps.execute'), t('steps.complete')].map(
								(step, index) => (
									<div key={step} className="flex flex-col items-center flex-1">
										<div
											className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${index <= progressStep
													? 'bg-primary text-primary-content border-primary shadow-lg scale-110'
													: 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-500'
												}`}
										>
											{index < progressStep ? (
												<i className="i-heroicons-check" />
											) : index === progressStep && (progressStep === 1 || progressStep === 2) ? (
												<div className="w-3 h-3 bg-current rounded-full animate-pulse" />
											) : (
												index + 1
											)}
										</div>
										<span
											className={`text-xs mt-2 font-medium transition-colors duration-300 ${index <= progressStep
													? 'text-primary dark:text-primary'
													: 'text-gray-400 dark:text-gray-500'
												}`}
										>
											{step}
										</span>
										{index < 3 && (
											<div
												className={`h-0.5 w-full mt-5 -mb-5 transition-colors duration-500 ${index < progressStep ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
													}`}
											/>
										)}
									</div>
								)
							)}
						</div>
					</div>

					{/* Main Controls */}
					<div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
						<button
							type="button"
							className={`btn btn-lg ${getRecordingButtonClass()} min-w-48 shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95`}
							onClick={handleRecordingToggle}
							disabled={isProcessing || !farm || !user}
						>
							{isRecording ? (
								<i className="i-heroicons-stop text-2xl" />
							) : (
								<i className="i-heroicons-microphone text-2xl" />
							)}
							<span className="ml-2">{getRecordingButtonText()}</span>
						</button>

						{isRecording && (
							<button
								type="button"
								className="btn btn-outline btn-error hover:btn-error transition-all duration-300 animate-in slide-in-from-left-3"
								onClick={cancelRecording}
							>
								<i className="i-heroicons-x-mark" />
								{t('cancel')}
							</button>
						)}
					</div>

					{/* Processing Indicator */}
					{isProcessing && (
						<div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700 animate-in slide-in-from-bottom-3 duration-500">
							<div className="flex items-center gap-3">
								<div className="loading loading-spinner loading-sm text-primary" />
								<div className="flex-1">
									<p className="font-medium text-gray-900 dark:text-gray-100">
										{t('status.processingVoiceCommand')}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">
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
									<p className="text-gray-700 dark:text-gray-300 italic">"{transcription}"</p>
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
											className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${result.success
													? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
													: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
												}`}
										>
											<div className="flex items-start gap-3">
												<i
													className={`${result.success
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
					<div className="flex justify-end">
						<button
							type="button"
							className="btn btn-outline btn-sm hover:btn-primary transition-all duration-300 transform hover:scale-105"
							onClick={reset}
						>
							<i className="i-heroicons-arrow-path" />
							{t('reset')}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
