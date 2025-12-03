import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
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

	// Auto-refresh data based on voice operations
	const queryClient = useQueryClient()

	useEffect(() => {
		if (processingResponse?.success && processingResponse.data) {
			Object.entries(processingResponse.data).forEach(([type, operations]) => {
				if (!Array.isArray(operations) || operations.length === 0) return

				// Invalidate queries based on operation type
				switch (type) {
					case 'animals':
						queryClient.invalidateQueries({ queryKey: ['animals'] })
						break
					case 'health':
						queryClient.invalidateQueries({ queryKey: ['health-records'] })
						// Also invalidate animals as health status might change
						queryClient.invalidateQueries({ queryKey: ['animals'] })
						break
					case 'production':
						queryClient.invalidateQueries({ queryKey: ['production-records'] })
						break
					case 'tasks':
						queryClient.invalidateQueries({ queryKey: ['tasks'] })
						break
					case 'relations':
						queryClient.invalidateQueries({ queryKey: ['related-animals'] })
						break
					case 'calendar':
						queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
						break
				}
			})
		}
	}, [processingResponse, queryClient])

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

	// Get background color based on state - Deep Liquid Glass
	const getBackgroundClass = () => {
		const baseGlass =
			'backdrop-blur-3xl bg-white/5 dark:bg-black/20 border-white/20 dark:border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]'

		switch (currentState) {
			case 'recording':
				return `${baseGlass} border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)]`
			case 'processing':
				return `${baseGlass} border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)]`
			case 'done':
				return `${baseGlass} border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.2)]`
			default:
				return `${baseGlass} shadow-2xl`
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
				className={`
					relative overflow-hidden rounded-[2.5rem] transition-all duration-700
					${getBackgroundClass()}
				`}
			>
				{/* Glass Reflection Overlay */}
				<div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />

				<div className="card-body p-8 sm:p-12 relative z-10">
					{/* Status Message */}
					<div className="text-center mb-12">
						<h2 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-md mb-4 tracking-tight">
							{getStatusMessage()}
						</h2>
						{isRecording && (
							<p className="text-xl text-white/80 font-medium animate-pulse tracking-wide">
								{t('listening')}
							</p>
						)}
					</div>

					{/* Giant Recording Button */}
					<div className="flex flex-col items-center gap-8 mb-8">
						<button
							type="button"
							onClick={handleRecordingToggle}
							disabled={isProcessing || !farm || !user}
							className={`
								relative rounded-full 
								transition-all duration-500 transform
								cursor-pointer flex items-center justify-center
								w-56 h-56 shadow-2xl hover:scale-105
								${isRecording
									? 'bg-red-500/20 backdrop-blur-md shadow-[0_0_60px_rgba(239,68,68,0.4)] border border-red-500/30'
									: ''
								}
								${!isRecording && !isProcessing
									? 'bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(255,255,255,0.2)] hover:bg-white/20'
									: ''
								}
								${isProcessing
									? 'bg-blue-500/10 backdrop-blur-md border border-blue-500/20 cursor-not-allowed'
									: ''
								}
								disabled:opacity-50 disabled:cursor-not-allowed
								focus:outline-none focus:ring-4 focus:ring-white/30
							`}
						>
							{/* Organic Ripple Effect */}
							{isRecording && (
								<>
									<span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping duration-[2s]" />
									<span className="absolute inset-0 rounded-full bg-red-500/10 animate-ping animation-delay-1000 duration-[2s]" />
								</>
							)}

							{/* Icon */}
							<div className="relative z-10">
								{isRecording ? (
									<div className="w-24 h-24 bg-red-500 rounded-2xl animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.6)]" />
								) : isProcessing ? (
									<div className="loading loading-spinner loading-lg text-white w-24 h-24" />
								) : (
									<i className="i-heroicons-microphone text-9xl text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" />
								)}
							</div>

							{/* Breathing animation when ready */}
							{!isRecording && !isProcessing && (
								<span className="absolute inset-0 rounded-full bg-white/5 animate-pulse duration-[3s]" />
							)}
						</button>

						{/* Button Label */}
						<div className="text-center">
							<p className="text-2xl font-semibold text-white/90 drop-shadow-sm">
								{isRecording
									? t('stopRecording')
									: isProcessing
										? t('processing')
										: t('pressToSpeak')}
							</p>
						</div>

						{/* Recording Timer - Extra Large */}
						{(isRecording || recordingTime > 0) && (
							<div className="flex flex-col items-center gap-3 animate-in slide-in-from-bottom-3 duration-300">
								<div className="text-7xl font-mono font-bold text-white drop-shadow-lg tabular-nums tracking-wider">
									{formatTime(recordingTime)}
								</div>
								<div className="text-xl text-white/60 font-medium">
									/ {formatTime(maxRecordingTime)}
								</div>
								{/* Progress bar */}
								<div className="w-72 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
									<div
										className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-1000"
										style={{ width: `${(recordingTime / maxRecordingTime) * 100}%` }}
									/>
								</div>
							</div>
						)}

						{/* Cancel Button (only when recording) */}
						{isRecording && (
							<button
								type="button"
								className="btn btn-lg btn-ghost text-white hover:bg-white/10 transition-all duration-300 animate-in slide-in-from-bottom-3 mt-4"
								onClick={cancelRecording}
							>
								<i className="i-heroicons-x-mark text-2xl" />
								<span className="text-xl">{t('cancel')}</span>
							</button>
						)}
					</div>

					{/* Processing Indicator */}
					{isProcessing && (
						<div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 animate-in slide-in-from-bottom-3 duration-500">
							<div className="flex flex-col items-center gap-4 text-center">
								<div className="loading loading-spinner loading-lg text-white" />
								<div>
									<p className="text-2xl font-bold text-white mb-2">
										{t('status.processingVoiceCommand')}
									</p>
									<p className="text-lg text-white/70">{t('status.aiAnalyzing')}</p>
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
						<div className="card bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-lg">
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
						<div className="card bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-lg">
							<div className="card-body p-4">
								<div className="flex items-center gap-3 mb-3">
									<i className="i-heroicons-microphone text-blue-600 text-lg" />
									<span className="font-semibold text-blue-900 dark:text-blue-100">
										{t('transcription')}
									</span>
								</div>
								<div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-white/10">
									<p className="text-lg text-gray-700 dark:text-gray-300 italic">
										"{transcription}"
									</p>
								</div>
							</div>
						</div>
					)}

					{/* AI Analysis Results */}
					{processingResponse && (
						<div className="card bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-lg">
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
						<div className="card bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-lg">
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
												? 'bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
												: 'bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
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
