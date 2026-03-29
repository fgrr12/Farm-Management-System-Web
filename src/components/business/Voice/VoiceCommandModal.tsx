import { useQueryClient } from '@tanstack/react-query'
import { memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import type { VoicePhase } from '@/hooks/voice/useVoiceRecorder'
import { useVoiceRecorder } from '@/hooks/voice/useVoiceRecorder'

interface VoiceCommandModalProps {
	isOpen: boolean
	onClose: () => void
}

const STEPS = ['record', 'process', 'results'] as const

function getStepIndex(phase: VoicePhase): number {
	switch (phase) {
		case 'idle':
		case 'recording':
			return 0
		case 'processing':
			return 1
		case 'done':
		case 'error':
			return 2
	}
}

export const VoiceCommandModal = memo<VoiceCommandModalProps>(({ isOpen, onClose }) => {
	const { t } = useTranslation(['voiceRecorder'])
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const queryClient = useQueryClient()

	const {
		phase,
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
		maxRecordingTime: 60,
		onError: (err) => console.error('Voice recording error:', err),
	})

	// Invalidate queries when operations complete
	useEffect(() => {
		if (processingResponse?.success && processingResponse.data) {
			for (const [type, operations] of Object.entries(processingResponse.data)) {
				if (!Array.isArray(operations) || operations.length === 0) continue
				switch (type) {
					case 'animals':
						queryClient.invalidateQueries({ queryKey: ['animals'] })
						break
					case 'health':
						queryClient.invalidateQueries({ queryKey: ['health-records'] })
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
			}
		}
	}, [processingResponse, queryClient])

	// Reset on close
	useEffect(() => {
		if (!isOpen) {
			// Small delay to let close animation finish
			const timer = setTimeout(reset, 300)
			return () => clearTimeout(timer)
		}
	}, [isOpen, reset])

	// Close on Escape key
	useEffect(() => {
		if (!isOpen) return
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && !isRecording && !isProcessing) {
				onClose()
			}
		}
		document.addEventListener('keydown', handleKey)
		return () => document.removeEventListener('keydown', handleKey)
	}, [isOpen, isRecording, isProcessing, onClose])

	const handleClose = useCallback(() => {
		if (isRecording) cancelRecording()
		if (!isProcessing) onClose()
	}, [isRecording, isProcessing, cancelRecording, onClose])

	const handleRecordToggle = useCallback(async () => {
		if (isRecording) {
			await stopRecording()
		} else {
			await startRecording()
		}
	}, [isRecording, stopRecording, startRecording])

	const handleRecordAgain = useCallback(() => {
		reset()
	}, [reset])

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}:${secs.toString().padStart(2, '0')}`
	}

	if (!isOpen) return null

	const currentStep = getStepIndex(phase)
	const successCount = executionResults.filter((r) => r.success).length
	const errorCount = executionResults.filter((r) => !r.success).length

	return (
		<div
			className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
			role="dialog"
			aria-modal="true"
			aria-label={t('title')}
		>
			{/* biome-ignore lint: jsx-a11y/no-static-element-interactions */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-modal-backdrop-in"
				onClick={handleClose}
				onKeyDown={(e) => e.key === 'Enter' && handleClose()}
			/>

			{/* Modal content */}
			<div className="relative w-full sm:max-w-lg mx-auto sm:mx-4 bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl animate-modal-content-in max-h-[90vh] flex flex-col overflow-hidden">
				{/* Header */}
				<div className="shrink-0 px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-xl bg-linear-to-br from-pink-500 to-purple-600 text-white shadow-md">
								<span className="i-heroicons-microphone w-5 h-5" />
							</div>
							<h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('title')}</h2>
						</div>
						<button
							type="button"
							onClick={handleClose}
							disabled={isProcessing}
							aria-label={t('close')}
							className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
						>
							<span className="i-heroicons-x-mark w-5 h-5" />
						</button>
					</div>

					{/* Step indicator */}
					<div className="flex items-center justify-center mt-4 gap-0">
						{STEPS.map((step, index) => (
							<div key={step} className="flex items-center">
								{/* Step circle */}
								<div className="flex flex-col items-center">
									<div
										className={`
											w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500
											${
												index < currentStep
													? 'bg-green-500 text-white'
													: index === currentStep
														? 'bg-linear-to-br from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30 scale-110'
														: 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
											}
										`}
									>
										{index < currentStep ? (
											<span className="i-heroicons-check-mini w-5 h-5" />
										) : (
											index + 1
										)}
									</div>
									<span
										className={`text-xs mt-1 font-medium transition-colors duration-300 ${
											index <= currentStep
												? 'text-gray-900 dark:text-white'
												: 'text-gray-400 dark:text-gray-500'
										}`}
									>
										{t(`stepper.${step}`)}
									</span>
								</div>
								{/* Connector line */}
								{index < STEPS.length - 1 && (
									<div className="w-16 sm:w-24 h-0.5 mx-2 mb-5 rounded-full transition-colors duration-500">
										<div
											className={`h-full rounded-full transition-all duration-500 ${
												index < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
											}`}
										/>
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Body */}
				<div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
					{/* ────── STEP 1: Record ────── */}
					{(phase === 'idle' || phase === 'recording') && (
						<div className="flex flex-col items-center text-center gap-6 py-4">
							{/* Instruction text */}
							<div>
								<p className="text-xl font-bold text-gray-900 dark:text-white">
									{isRecording ? t('listening') : t('tapToRecord')}
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
									{isRecording ? t('stopRecordingHint') : t('speakNaturally')}
								</p>
							</div>

							{/* Mic button */}
							<div className="relative">
								{/* Pulse rings when recording */}
								{isRecording && (
									<>
										<span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
										<span className="absolute -inset-3 rounded-full border-4 border-red-300 dark:border-red-700 opacity-50 animate-pulse" />
									</>
								)}
								{/* Subtle pulse when idle */}
								{phase === 'idle' && (
									<span className="absolute inset-0 rounded-full bg-pink-400 animate-ping opacity-20" />
								)}

								<button
									type="button"
									onClick={handleRecordToggle}
									disabled={!farm || !user}
									aria-label={isRecording ? t('stopRecording') : t('startRecording')}
									className={`
										relative w-32 h-32 rounded-full transition-all duration-300 cursor-pointer
										flex items-center justify-center
										focus:outline-none focus:ring-8 focus:ring-pink-300 dark:focus:ring-pink-800
										disabled:opacity-50 disabled:cursor-not-allowed
										${
											isRecording
												? 'bg-red-500 hover:bg-red-600 shadow-2xl shadow-red-500/40 scale-105'
												: 'bg-linear-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-2xl shadow-pink-500/30 hover:scale-105'
										}
									`}
								>
									{isRecording ? (
										<div className="w-12 h-12 bg-white rounded-lg animate-pulse" />
									) : (
										<span className="i-heroicons-microphone text-white w-16! h-16! drop-shadow-lg" />
									)}
								</button>
							</div>

							{/* Timer */}
							{isRecording && (
								<div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-3 duration-300">
									<div className="text-4xl font-mono font-bold text-red-600 dark:text-red-400 tabular-nums">
										{formatTime(recordingTime)}
									</div>
									<div className="text-sm text-gray-400">/ {formatTime(60)}</div>
									<div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
										<div
											className="h-full bg-red-500 transition-all duration-1000 rounded-full"
											style={{ width: `${(recordingTime / 60) * 100}%` }}
										/>
									</div>
								</div>
							)}

							{/* Cancel button */}
							{isRecording && (
								<button
									type="button"
									onClick={cancelRecording}
									className="text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors cursor-pointer"
								>
									{t('cancel')}
								</button>
							)}
						</div>
					)}

					{/* ────── STEP 2: Processing ────── */}
					{phase === 'processing' && (
						<div className="flex flex-col items-center text-center gap-6 py-4 animate-in fade-in duration-500">
							{/* Spinner */}
							<div className="relative w-24 h-24 flex items-center justify-center">
								<div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-600" />
								<div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 border-r-purple-500 animate-spin" />
								<span className="i-heroicons-cpu-chip text-purple-500 w-10 h-10" />
							</div>

							<div>
								<p className="text-xl font-bold text-gray-900 dark:text-white">
									{t('analyzingCommand')}
								</p>
								<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
									{t('status.aiAnalyzing')}
								</p>
							</div>

							{/* Audio mini-player */}
							{audioURL && (
								<div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
									<div className="flex items-center gap-2 mb-2">
										<span className="i-heroicons-speaker-wave text-gray-400 w-4 h-4" />
										<span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
											{t('recordedAudio')}
										</span>
									</div>
									<audio controls className="w-full h-8" style={{ height: '32px' }}>
										<source src={audioURL} type="audio/webm" />
										<track kind="captions" srcLang="en" label="English captions" />
									</audio>
								</div>
							)}

							{/* Transcription preview (streams in) */}
							{transcription && (
								<div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
									<div className="flex items-center gap-2 mb-2">
										<span className="i-heroicons-chat-bubble-bottom-center-text text-blue-500 w-4 h-4" />
										<span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
											{t('transcription')}
										</span>
									</div>
									<p className="text-sm text-gray-700 dark:text-gray-300 italic">
										"{transcription}"
									</p>
								</div>
							)}
						</div>
					)}

					{/* ────── STEP 3: Results ────── */}
					{phase === 'done' && (
						<div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
							{/* Result header */}
							{(() => {
								const allFailed = successCount === 0
								const hasErrors = errorCount > 0
								const bannerClass = allFailed
									? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
									: hasErrors
										? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
										: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
								const iconBg = allFailed
									? 'bg-red-500'
									: hasErrors
										? 'bg-yellow-500'
										: 'bg-green-500'
								const icon = allFailed
									? 'i-heroicons-x-circle'
									: hasErrors
										? 'i-heroicons-exclamation-triangle'
										: 'i-heroicons-check-mini'
								const titleColor = allFailed
									? 'text-red-900 dark:text-red-100'
									: hasErrors
										? 'text-yellow-900 dark:text-yellow-100'
										: 'text-green-900 dark:text-green-100'
								const subtitleColor = allFailed
									? 'text-red-700 dark:text-red-300'
									: hasErrors
										? 'text-yellow-700 dark:text-yellow-300'
										: 'text-green-700 dark:text-green-300'
								const titleKey = allFailed
									? 'operationsFailed'
									: hasErrors
										? 'operationsPartial'
										: 'operationsCompleted'

								return (
									<div className={`flex items-center gap-3 p-4 rounded-xl border ${bannerClass}`}>
										<div
											className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
										>
											<span className={`${icon} text-white w-6 h-6`} />
										</div>
										<div>
											<p className={`font-semibold ${titleColor}`}>{t(titleKey)}</p>
											<p className={`text-sm ${subtitleColor}`}>
												{t('successCount', { count: successCount })}
												{errorCount > 0 && ` · ${t('errorCount', { count: errorCount })}`}
											</p>
										</div>
									</div>
								)
							})()}

							{/* Transcription */}
							{transcription && (
								<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
									<div className="flex items-center gap-2 mb-2">
										<span className="i-heroicons-chat-bubble-bottom-center-text text-gray-400 w-4 h-4" />
										<span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
											{t('transcription')}
										</span>
									</div>
									<p className="text-sm text-gray-700 dark:text-gray-300 italic">
										"{transcription}"
									</p>
								</div>
							)}

							{/* Operations badges */}
							{processingResponse?.data && (
								<div className="flex flex-wrap gap-2">
									{Object.entries(processingResponse.data).map(([type, operations]) => {
										if (!Array.isArray(operations) || operations.length === 0) return null
										return (
											<span
												key={type}
												className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
											>
												<OperationIcon type={type} />
												{t(`operations.${type}`)}: {operations.length}
											</span>
										)
									})}
								</div>
							)}

							{/* Execution results list */}
							{executionResults.length > 0 && (
								<div className="space-y-2">
									<p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
										{t('executionResults')}
									</p>
									{executionResults.map((result, index) => (
										<div
											key={index}
											className={`flex items-center gap-3 p-3 rounded-lg border ${
												result.success
													? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
													: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
											}`}
										>
											<span
												className={`shrink-0 w-5 h-5 ${
													result.success
														? 'i-heroicons-check-circle text-green-500'
														: 'i-heroicons-x-circle text-red-500'
												}`}
											/>
											<div className="flex-1 min-w-0">
												<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
													{t(`operations.${result.type}`)}
												</span>
												{result.operation && (
													<span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
														· {result.operation}
													</span>
												)}
												{!result.success && result.error && (
													<p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
														{result.error}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							)}

							{/* Warnings */}
							{processingResponse?.warnings && processingResponse.warnings.length > 0 && (
								<div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
									<div className="flex items-center gap-2 mb-1">
										<span className="i-heroicons-exclamation-triangle text-yellow-500 w-4 h-4" />
										<span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
											{t('warnings')} ({processingResponse.warnings.length})
										</span>
									</div>
									<ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-0.5 pl-6 list-disc">
										{processingResponse.warnings.map((warning, i) => (
											<li key={i}>{warning}</li>
										))}
									</ul>
								</div>
							)}

							{/* Audio playback */}
							{audioURL && (
								<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
									<audio controls className="w-full h-8" style={{ height: '32px' }}>
										<source src={audioURL} type="audio/webm" />
										<track kind="captions" srcLang="en" label="English captions" />
									</audio>
								</div>
							)}
						</div>
					)}

					{/* ────── Error state ────── */}
					{phase === 'error' && (
						<div className="flex flex-col items-center text-center gap-5 py-4 animate-in fade-in duration-300">
							<div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
								<span className="i-heroicons-exclamation-triangle text-red-500 w-8 h-8" />
							</div>
							<div>
								<p className="text-lg font-bold text-gray-900 dark:text-white">{t('errors')}</p>
								<p className="text-sm text-red-500 dark:text-red-400 mt-1 max-w-xs">{error}</p>
							</div>
						</div>
					)}
				</div>

				{/* Footer actions */}
				<div className="shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
					{phase === 'done' && (
						<div className="flex gap-3">
							<button
								type="button"
								onClick={handleRecordAgain}
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-sm cursor-pointer"
							>
								<span className="i-heroicons-arrow-path w-4 h-4" />
								{t('recordAgain')}
							</button>
							<button
								type="button"
								onClick={onClose}
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all font-medium text-sm shadow-md cursor-pointer"
							>
								{t('close')}
							</button>
						</div>
					)}
					{phase === 'error' && (
						<div className="flex gap-3">
							<button
								type="button"
								onClick={clearError}
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all font-medium text-sm shadow-md cursor-pointer"
							>
								<span className="i-heroicons-arrow-path w-4 h-4" />
								{t('tryAgain')}
							</button>
							<button
								type="button"
								onClick={onClose}
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-sm cursor-pointer"
							>
								{t('close')}
							</button>
						</div>
					)}
					{phase === 'idle' && (
						<p className="text-center text-xs text-gray-400 dark:text-gray-500">
							{t('maxDuration', { seconds: 60 })}
						</p>
					)}
					{phase === 'processing' && (
						<div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
							<div className="loading loading-dots loading-xs" />
							{t('processing')}
						</div>
					)}
				</div>
			</div>
		</div>
	)
})

VoiceCommandModal.displayName = 'VoiceCommandModal'

function OperationIcon({ type }: { type: string }) {
	const iconClass = (() => {
		switch (type) {
			case 'animals':
				return 'i-heroicons-sparkles'
			case 'health':
				return 'i-heroicons-heart'
			case 'production':
				return 'i-heroicons-chart-bar'
			case 'tasks':
				return 'i-heroicons-list-bullet'
			case 'relations':
				return 'i-heroicons-link'
			case 'calendar':
				return 'i-heroicons-calendar'
			default:
				return 'i-heroicons-document'
		}
	})()
	return <span className={`${iconClass} w-3.5 h-3.5`} />
}
