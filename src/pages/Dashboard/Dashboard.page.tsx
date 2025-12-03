import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { DashboardGrid } from '@/components/business/Dashboard/DashboardGrid'
import { DashboardStats } from '@/components/business/Dashboard/DashboardStats'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const Dashboard = () => {
	const { t } = useTranslation(['dashboard'])

	const { setPageTitle } = usePagePerformance()

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<PageContainer>
			<a
				href="#dashboard-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 dark:bg-blue-500 text-white p-2 rounded z-50"
			>
				{t('accessibility.skipToDashboard')}
			</a>

			<PageHeader
				icon="dashboard"
				title={t('title')}
				subtitle={t('subtitle')}
				stats={
					<div className="bg-white/10 dark:bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-white/20 dark:border-white/25">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
							<span className="text-sm font-medium text-white">{t('liveData')}</span>
						</div>
					</div>
				}
				actions={
					<section aria-label={t('farmStatistics')}>
						<DashboardStats />
					</section>
				}
			/>

			{/* Main Content Grid - Role-based widgets */}
			<div
				id="dashboard-content"
				className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
			>
				<div className="p-4 sm:p-6">
					<DashboardGrid />
				</div>
			</div>
		</PageContainer>
	)
}

export default memo(Dashboard)
