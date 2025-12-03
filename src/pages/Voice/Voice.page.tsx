import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { VoiceRecorder } from '@/components/business/Voice/VoiceRecorder'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'

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
		<PageContainer maxWidth="5xl">
			<a
				href="#voice-section"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white p-2 rounded z-50 transition-colors duration-200"
			>
				{t('accessibility.skipToRecording')}
			</a>

			<PageHeader
				icon="microphone"
				title={t('title')}
				subtitle={t('subtitle')}
				variant="default"
				className="mb-8"
			/>

			{/* Voice Recorder Section - Front and Center */}
			<div id="voice-section" className="mb-12">
				<VoiceRecorder className="w-full" maxRecordingTime={60} />
			</div>

			{/* How It Works - Simplified */}
			<div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 mb-8">
				<h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
					<i className="i-heroicons-information-circle text-blue-400" />
					{t('howItWorks')}
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					<div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
						<div className="w-14 h-14 bg-pink-500/20 text-pink-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pink-500/30">
							<span className="text-2xl font-bold">1</span>
						</div>
						<h3 className="font-semibold text-white mb-2 text-lg">{t('steps.record')}</h3>
						<p className="text-sm text-gray-300 leading-relaxed">{t('instructions.record')}</p>
					</div>
					<div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
						<div className="w-14 h-14 bg-blue-500/20 text-blue-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
							<span className="text-2xl font-bold">2</span>
						</div>
						<h3 className="font-semibold text-white mb-2 text-lg">{t('steps.process')}</h3>
						<p className="text-sm text-gray-300 leading-relaxed">{t('instructions.process')}</p>
					</div>
					<div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
						<div className="w-14 h-14 bg-green-500/20 text-green-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/30">
							<span className="text-2xl font-bold">3</span>
						</div>
						<h3 className="font-semibold text-white mb-2 text-lg">{t('steps.execute')}</h3>
						<p className="text-sm text-gray-300 leading-relaxed">{t('instructions.execute')}</p>
					</div>
					<div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
						<div className="w-14 h-14 bg-purple-500/20 text-purple-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
							<span className="text-2xl font-bold">4</span>
						</div>
						<h3 className="font-semibold text-white mb-2 text-lg">{t('steps.review')}</h3>
						<p className="text-sm text-gray-300 leading-relaxed">{t('instructions.review')}</p>
					</div>
				</div>
			</div>

			{/* Collapsible Examples Section */}
			<div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
				<button
					type="button"
					onClick={() => setShowExamples(!showExamples)}
					className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors"
				>
					<div className="flex items-center gap-3">
						<i className="i-heroicons-light-bulb text-yellow-400 text-xl" />
						<h2 className="text-xl font-bold text-white">{t('exampleCommands')}</h2>
					</div>
					<i
						className={`i-heroicons-chevron-down text-gray-400 transition-transform duration-300 ${showExamples ? 'rotate-180' : ''
							}`}
					/>
				</button>

				{showExamples && (
					<div className="p-8 border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Animal Management Examples */}
							<div className="bg-white/5 rounded-2xl p-6 border border-white/5">
								<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
									<i className="i-heroicons-sparkles text-blue-400" />
									{t('animalManagement')}
								</h3>
								<ul className="space-y-3">
									{Array.isArray(t('examples.animals', { returnObjects: true })) &&
										(t('examples.animals', { returnObjects: true }) as string[]).map(
											(example, index) => (
												<li
													key={index}
													className="text-sm text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5 hover:border-white/20 transition-colors"
												>
													"{example}"
												</li>
											)
										)}
								</ul>
							</div>

							{/* Health Records Examples */}
							<div className="bg-white/5 rounded-2xl p-6 border border-white/5">
								<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
									<i className="i-heroicons-heart text-red-400" />
									{t('healthRecords')}
								</h3>
								<ul className="space-y-3">
									{Array.isArray(t('examples.health', { returnObjects: true })) &&
										(t('examples.health', { returnObjects: true }) as string[]).map(
											(example, index) => (
												<li
													key={index}
													className="text-sm text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5 hover:border-white/20 transition-colors"
												>
													"{example}"
												</li>
											)
										)}
								</ul>
							</div>

							{/* Production Records Examples */}
							<div className="bg-white/5 rounded-2xl p-6 border border-white/5">
								<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
									<i className="i-heroicons-chart-bar text-green-400" />
									{t('productionRecords')}
								</h3>
								<ul className="space-y-3">
									{Array.isArray(t('examples.production', { returnObjects: true })) &&
										(t('examples.production', { returnObjects: true }) as string[]).map(
											(example, index) => (
												<li
													key={index}
													className="text-sm text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5 hover:border-white/20 transition-colors"
												>
													"{example}"
												</li>
											)
										)}
								</ul>
							</div>

							{/* Task Management Examples */}
							<div className="bg-white/5 rounded-2xl p-6 border border-white/5">
								<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
									<i className="i-heroicons-list-bullet text-purple-400" />
									{t('taskManagement')}
								</h3>
								<ul className="space-y-3">
									{Array.isArray(t('examples.tasks', { returnObjects: true })) &&
										(t('examples.tasks', { returnObjects: true }) as string[]).map(
											(example, index) => (
												<li
													key={index}
													className="text-sm text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5 hover:border-white/20 transition-colors"
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
		</PageContainer>

	)
}

export default VoicePage
