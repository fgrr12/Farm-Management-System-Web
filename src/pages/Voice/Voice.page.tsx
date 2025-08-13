import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import type { ExecutionResult, VoiceProcessingResponse } from '@/services/voice'

import { VoiceRecorder } from '@/components/business/Voice/VoiceRecorder'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

export function VoicePage() {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const { t } = useTranslation(['voice'])
	const { setPageTitle } = usePagePerformance()

	// State para mostrar resultados al usuario
	const [lastTranscription, setLastTranscription] = useState<string | null>(null)
	const [lastProcessingResponse, setLastProcessingResponse] =
		useState<VoiceProcessingResponse | null>(null)
	const [lastExecutionResults, setLastExecutionResults] = useState<ExecutionResult[]>([])
	const [showResults, setShowResults] = useState(false)

	// Set page title on mount
	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	const handleTranscriptionComplete = useCallback((transcription: string) => {
		console.log('Transcription completed:', transcription)
		setLastTranscription(transcription)
		setShowResults(true)
	}, [])

	const handleProcessingComplete = useCallback((response: VoiceProcessingResponse) => {
		console.log('Processing completed:', response)
		setLastProcessingResponse(response)
		setShowResults(true)
	}, [])

	const handleExecutionComplete = useCallback((results: ExecutionResult[]) => {
		console.log('Execution completed:', results)
		setLastExecutionResults(results)
		setShowResults(true)
	}, [])

	const clearResults = useCallback(() => {
		setLastTranscription(null)
		setLastProcessingResponse(null)
		setLastExecutionResults([])
		setShowResults(false)
	}, [])

	if (!user || !farm) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="loading loading-spinner loading-lg mb-4" />
					<p className="text-gray-600 dark:text-gray-400">Loading...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
			<div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				<a
					href="#voice-section"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white p-2 rounded z-50 transition-colors duration-200"
				>
					{t('accessibility.skipToRecording')}
				</a>

				{/* Hero Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300">
					<div className="bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-700 dark:to-purple-700 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 dark:bg-white/30 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg dark:shadow-black/20 backdrop-blur-sm">
								<i className="i-heroicons-microphone bg-white! w-6! h-6! sm:w-8 sm:h-8 drop-shadow-sm" />
							</div>
							<div className="min-w-0">
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-sm">
									{t('title')}
								</h1>
								<p className="text-pink-100 dark:text-pink-200 text-sm sm:text-base mt-1 drop-shadow-sm">
									{t('subtitle')}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Voice Recorder Section */}
				<div
					id="voice-section"
					className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300"
				>
					<div className="p-4 sm:p-6 lg:p-8">
						<VoiceRecorder
							className="w-full"
							autoExecute={false}
							maxRecordingTime={60}
							onTranscriptionComplete={handleTranscriptionComplete}
							onProcessingComplete={handleProcessingComplete}
							onExecutionComplete={handleExecutionComplete}
						/>
					</div>
				</div>

				{/* Results Section */}
				{showResults && (
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300">
						<div className="bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-700 dark:to-cyan-700 px-4 sm:px-6 py-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
									<i className="i-heroicons-document-text bg-white! w-6! h-6!" />
									{t('results.title')}
								</h2>
								<button
									type="button"
									onClick={clearResults}
									className="btn btn-sm bg-white/20 hover:bg-white/30 border-white/30 text-white"
								>
									<i className="i-heroicons-x-mark w-4! h-4!" />
									{t('actions.clearResults')}
								</button>
							</div>
						</div>

						<div className="p-4 sm:p-6 lg:p-8 space-y-6">
							{/* Transcription Result */}
							{lastTranscription && (
								<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-700">
									<h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
										<i className="i-heroicons-microphone bg-blue-600! w-5! h-5!" />
										{t('results.transcription')}
									</h3>
									<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-600">
										<p className="text-base text-gray-700 dark:text-gray-300 italic">
											"{lastTranscription}"
										</p>
									</div>
								</div>
							)}

							{/* AI Processing Result */}
							{lastProcessingResponse && (
								<div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-700">
									<h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
										<i className="i-heroicons-cpu-chip bg-purple-600! w-5! h-5!" />
										{t('results.aiProcessing')}
									</h3>

									<div className="space-y-4">
										<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-600">
											<div className="flex items-center gap-2 mb-2">
												<span className="font-semibold text-gray-700 dark:text-gray-300">
													{t('results.status')}:
												</span>
												<span
													className={`badge ${lastProcessingResponse.success ? 'badge-success' : 'badge-error'}`}
												>
													{lastProcessingResponse.success
														? t('results.success')
														: t('results.error')}
												</span>
											</div>

											{lastProcessingResponse.transcription && (
												<div className="mb-2">
													<span className="font-semibold text-gray-700 dark:text-gray-300">
														{t('results.transcription')}:
													</span>
													<div className="mt-1 text-sm text-gray-600 dark:text-gray-400 italic">
														"{lastProcessingResponse.transcription}"
													</div>
												</div>
											)}

											{lastProcessingResponse.data && (
												<div className="mb-2">
													<span className="font-semibold text-gray-700 dark:text-gray-300">
														{t('results.operations')}:
													</span>
													<div className="mt-2 space-y-1">
														{lastProcessingResponse.data.animals &&
															lastProcessingResponse.data.animals.length > 0 && (
																<span className="badge badge-primary mr-1">
																	Animals: {lastProcessingResponse.data.animals.length}
																</span>
															)}
														{lastProcessingResponse.data.health &&
															lastProcessingResponse.data.health.length > 0 && (
																<span className="badge badge-secondary mr-1">
																	Health: {lastProcessingResponse.data.health.length}
																</span>
															)}
														{lastProcessingResponse.data.production &&
															lastProcessingResponse.data.production.length > 0 && (
																<span className="badge badge-accent mr-1">
																	Production: {lastProcessingResponse.data.production.length}
																</span>
															)}
														{lastProcessingResponse.data.tasks &&
															lastProcessingResponse.data.tasks.length > 0 && (
																<span className="badge badge-info mr-1">
																	Tasks: {lastProcessingResponse.data.tasks.length}
																</span>
															)}
														{lastProcessingResponse.data.relations &&
															lastProcessingResponse.data.relations.length > 0 && (
																<span className="badge badge-warning mr-1">
																	Relations: {lastProcessingResponse.data.relations.length}
																</span>
															)}
														{lastProcessingResponse.data.calendar &&
															lastProcessingResponse.data.calendar.length > 0 && (
																<span className="badge badge-neutral mr-1">
																	Calendar: {lastProcessingResponse.data.calendar.length}
																</span>
															)}
													</div>
												</div>
											)}

											{lastProcessingResponse.errors &&
												lastProcessingResponse.errors.length > 0 && (
													<div className="mb-2">
														<span className="font-semibold text-error">{t('results.errors')}:</span>
														<ul className="mt-1 list-disc list-inside text-sm text-error">
															{lastProcessingResponse.errors.map((error, index) => (
																<li key={index}>{error}</li>
															))}
														</ul>
													</div>
												)}

											{lastProcessingResponse.warnings &&
												lastProcessingResponse.warnings.length > 0 && (
													<div className="mb-2">
														<span className="font-semibold text-warning">
															{t('results.warnings')}:
														</span>
														<ul className="mt-1 list-disc list-inside text-sm text-warning">
															{lastProcessingResponse.warnings.map((warning, index) => (
																<li key={index}>{warning}</li>
															))}
														</ul>
													</div>
												)}

											{lastProcessingResponse.tokensUsed && (
												<div className="text-xs text-gray-500 dark:text-gray-400">
													Tokens used: {lastProcessingResponse.tokensUsed} | Processing time:{' '}
													{lastProcessingResponse.processingTime}ms
												</div>
											)}
										</div>
									</div>
								</div>
							)}

							{/* Execution Results */}
							{lastExecutionResults.length > 0 && (
								<div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-700">
									<h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
										<i className="i-heroicons-play bg-green-600! w-5! h-5!" />
										{t('results.execution')} ({lastExecutionResults.length})
									</h3>

									<div className="space-y-3">
										{lastExecutionResults.map((result, index) => (
											<div
												key={index}
												className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-600"
											>
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center gap-2">
														<span className="font-medium text-gray-700 dark:text-gray-300">
															{result.type}
														</span>
														{result.operation && (
															<span className="badge badge-outline text-xs">
																{result.operation}
															</span>
														)}
													</div>
													<span
														className={`badge ${result.success ? 'badge-success' : 'badge-error'}`}
													>
														{result.success ? t('results.success') : t('results.error')}
													</span>
												</div>

												{result.id && (
													<div className="mb-2 text-sm">
														<span className="font-semibold text-gray-600 dark:text-gray-400">
															ID:
														</span>
														<span className="ml-2 text-gray-700 dark:text-gray-300 font-mono">
															{result.id}
														</span>
													</div>
												)}

												{result.error && (
													<div className="text-sm">
														<span className="font-semibold text-error">
															{t('results.errorMessage')}:
														</span>
														<span className="ml-2 text-gray-600 dark:text-gray-400">
															{result.error}
														</span>
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Instructions Section */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300">
					<div className="bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-700 dark:to-green-700 px-4 sm:px-6 py-4">
						<h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
							<i className="i-heroicons-light-bulb bg-white! w-6! h-6!" />
							{t('exampleCommands')}
						</h2>
					</div>
					<div className="p-4 sm:p-6 lg:p-8">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
							{/* Animal Management Examples */}
							<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-heroicons-sparkles bg-blue-500! w-5! h-5!" />
									{t('animalManagement')}
								</h3>
								<ul className="space-y-2">
									{Array.isArray(t('examples.animals', { returnObjects: true })) &&
										(t('examples.animals', { returnObjects: true }) as string[]).map(
											(example, index) => (
												<li
													key={index}
													className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-600 p-3 rounded-lg border border-gray-200 dark:border-gray-500"
												>
													"{example}"
												</li>
											)
										)}
								</ul>
							</div>

							{/* Health Records Examples */}
							<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-heroicons-heart bg-red-500! w-5! h-5!" />
									{t('healthRecords')}
								</h3>
								<ul className="space-y-2">
									{Array.isArray(t('examples.health', { returnObjects: true })) &&
										(t('examples.health', { returnObjects: true }) as string[]).map(
											(example, index) => (
												<li
													key={index}
													className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-600 p-3 rounded-lg border border-gray-200 dark:border-gray-500"
												>
													"{example}"
												</li>
											)
										)}
								</ul>
							</div>

							{/* Production Records Examples */}
							<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-heroicons-chart-bar bg-green-500! w-5! h-5!" />
									{t('productionRecords')}
								</h3>
								<ul className="space-y-2">
									{Array.isArray(t('examples.production', { returnObjects: true })) &&
										(t('examples.production', { returnObjects: true }) as string[]).map(
											(example, index) => (
												<li
													key={index}
													className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-600 p-3 rounded-lg border border-gray-200 dark:border-gray-500"
												>
													"{example}"
												</li>
											)
										)}
								</ul>
							</div>

							{/* Task Management Examples */}
							<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-heroicons-list-bullet bg-purple-500! w-5! h-5!" />
									{t('taskManagement')}
								</h3>
								<ul className="space-y-2">
									{Array.isArray(t('examples.tasks', { returnObjects: true })) &&
										(t('examples.tasks', { returnObjects: true }) as string[]).map(
											(example, index) => (
												<li
													key={index}
													className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-600 p-3 rounded-lg border border-gray-200 dark:border-gray-500"
												>
													"{example}"
												</li>
											)
										)}
								</ul>
							</div>
						</div>
					</div>
				</div>

				{/* How It Works Section */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300">
					<div className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-700 dark:to-blue-700 px-4 sm:px-6 py-4">
						<h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
							<i className="i-heroicons-cog-6-tooth bg-white! w-6! h-6!" />
							{t('howItWorks')}
						</h2>
					</div>
					<div className="p-4 sm:p-6 lg:p-8">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
							<div className="text-center">
								<div className="w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
									<i className="i-heroicons-microphone bg-pink-600! dark:bg-pink-400! w-8! h-8!" />
								</div>
								<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
									1. {t('steps.record')}
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{t('instructions.record')}
								</p>
							</div>
							<div className="text-center">
								<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
									<i className="i-heroicons-cpu-chip bg-blue-600! dark:bg-blue-400! w-8! h-8!" />
								</div>
								<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
									2. {t('steps.process')}
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{t('instructions.process')}
								</p>
							</div>
							<div className="text-center">
								<div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
									<i className="i-heroicons-play bg-green-600! dark:bg-green-400! w-8! h-8!" />
								</div>
								<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
									3. {t('steps.execute')}
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{t('instructions.execute')}
								</p>
							</div>
							<div className="text-center">
								<div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
									<i className="i-heroicons-check-circle bg-purple-600! dark:bg-purple-400! w-8! h-8!" />
								</div>
								<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
									4. {t('steps.review')}
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{t('instructions.review')}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default VoicePage
