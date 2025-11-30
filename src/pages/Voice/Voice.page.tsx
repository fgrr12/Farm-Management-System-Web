import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { VoiceRecorder } from '@/components/business/Voice/VoiceRecorder'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

export function VoicePage() {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const { t } = useTranslation(['voice'])
	const { setPageTitle } = usePagePerformance()
	const [showExamples, setShowExamples] = useState(false)

	// Set page title on mount
	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	if (!user || !farm) {
		return (
			<div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="loading loading-spinner loading-lg mb-4" />
					<p className="text-gray-600 dark:text-gray-400">Loading...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
			<div className="max-w-5xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				<a
					href="#voice-section"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white p-2 rounded z-50 transition-colors duration-200"
				>
					{t('accessibility.skipToRecording')}
				</a>

				{/* Hero Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300">
					<div className="bg-linear-to-r from-pink-600 to-purple-600 dark:from-pink-700 dark:to-purple-700 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 dark:bg-white/30 rounded-full flex items-center justify-center shrink-0 shadow-lg dark:shadow-black/20 backdrop-blur-sm">
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

				{/* Voice Recorder Section - Front and Center */}
				<div id="voice-section" className="mb-8">
					<VoiceRecorder className="w-full" maxRecordingTime={60} />
				</div>

				{/* How It Works - Simplified */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
						<i className="i-heroicons-information-circle text-blue-600" />
						{t('howItWorks')}
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
							<div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
								<span className="text-white text-xl font-bold">1</span>
							</div>
							<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
								{t('steps.record')}
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">{t('instructions.record')}</p>
						</div>
						<div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
							<div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
								<span className="text-white text-xl font-bold">2</span>
							</div>
							<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
								{t('steps.process')}
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{t('instructions.process')}
							</p>
						</div>
						<div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
							<div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
								<span className="text-white text-xl font-bold">3</span>
							</div>
							<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
								{t('steps.execute')}
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{t('instructions.execute')}
							</p>
						</div>
						<div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
							<div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
								<span className="text-white text-xl font-bold">4</span>
							</div>
							<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
								{t('steps.review')}
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">{t('instructions.review')}</p>
						</div>
					</div>
				</div>

				{/* Collapsible Examples Section */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
					<button
						type="button"
						onClick={() => setShowExamples(!showExamples)}
						className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
					>
						<div className="flex items-center gap-2">
							<i className="i-heroicons-light-bulb text-yellow-600" />
							<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
								{t('exampleCommands')}
							</h2>
						</div>
						<i
							className={`i-heroicons-chevron-down text-gray-600 transition-transform ${showExamples ? 'rotate-180' : ''}`}
						/>
					</button>

					{showExamples && (
						<div className="p-6 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Animal Management Examples */}
								<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
										<i className="i-heroicons-sparkles text-blue-500" />
										{t('animalManagement')}
									</h3>
									<ul className="space-y-2">
										{Array.isArray(t('examples.animals', { returnObjects: true })) &&
											(t('examples.animals', { returnObjects: true }) as string[]).map(
												(example, index) => (
													<li
														key={index}
														className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-600 p-2 rounded border border-gray-200 dark:border-gray-500"
													>
														"{example}"
													</li>
												)
											)}
									</ul>
								</div>

								{/* Health Records Examples */}
								<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
										<i className="i-heroicons-heart text-red-500" />
										{t('healthRecords')}
									</h3>
									<ul className="space-y-2">
										{Array.isArray(t('examples.health', { returnObjects: true })) &&
											(t('examples.health', { returnObjects: true }) as string[]).map(
												(example, index) => (
													<li
														key={index}
														className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-600 p-2 rounded border border-gray-200 dark:border-gray-500"
													>
														"{example}"
													</li>
												)
											)}
									</ul>
								</div>

								{/* Production Records Examples */}
								<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
										<i className="i-heroicons-chart-bar text-green-500" />
										{t('productionRecords')}
									</h3>
									<ul className="space-y-2">
										{Array.isArray(t('examples.production', { returnObjects: true })) &&
											(t('examples.production', { returnObjects: true }) as string[]).map(
												(example, index) => (
													<li
														key={index}
														className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-600 p-2 rounded border border-gray-200 dark:border-gray-500"
													>
														"{example}"
													</li>
												)
											)}
									</ul>
								</div>

								{/* Task Management Examples */}
								<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
										<i className="i-heroicons-list-bullet text-purple-500" />
										{t('taskManagement')}
									</h3>
									<ul className="space-y-2">
										{Array.isArray(t('examples.tasks', { returnObjects: true })) &&
											(t('examples.tasks', { returnObjects: true }) as string[]).map(
												(example, index) => (
													<li
														key={index}
														className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-600 p-2 rounded border border-gray-200 dark:border-gray-500"
													>
														"{example}"
													</li>
												)
											)}
									</ul>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default VoicePage
