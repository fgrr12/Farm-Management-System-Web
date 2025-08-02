import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimalDistribution } from '@/components/business/Dashboard/AnimalDistribution'
import { DashboardStats } from '@/components/business/Dashboard/DashboardStats'
import { HealthOverview } from '@/components/business/Dashboard/HealthOverview'
import { ProductionChart } from '@/components/business/Dashboard/ProductionChart'
import { RecentActivities } from '@/components/business/Dashboard/RecentActivities'
import { TasksOverview } from '@/components/business/Dashboard/TasksOverview'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const Dashboard = () => {
	const { t } = useTranslation(['dashboard'])

	const { setPageTitle } = usePagePerformance()

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<div className="min-h-screen md:min-h-full bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				{/* Hero Header - Same style as Animals page */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700">
					<div className="bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-700 dark:to-green-700 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex items-center gap-3 sm:gap-4">
								<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 dark:bg-white/25 rounded-full flex items-center justify-center flex-shrink-0">
									<i className="i-material-symbols-dashboard bg-white! w-6! h-6! sm:w-8 sm:h-8" />
								</div>
								<div className="min-w-0">
									<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
										{t('title')}
									</h1>
									<p className="text-blue-100 dark:text-blue-200 text-sm sm:text-base mt-1">
										{t('subtitle')}
									</p>
								</div>
							</div>

							{/* Live Status Indicator */}
							<div className="flex items-center gap-2">
								<div className="bg-white/10 dark:bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-white/20 dark:border-white/25">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
										<span className="text-sm font-medium text-white">Live Data</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Stats Cards Section */}
					<div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
						<section aria-label="Farm Statistics">
							<DashboardStats />
						</section>
					</div>
				</div>

				{/* Main Content Grid - Same style as Animals page */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
					<div className="p-4 sm:p-6">
						<section
							aria-label="Dashboard Charts and Overview"
							className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
						>
							{/* Production Chart */}
							<div className="xl:col-span-2 order-1">
								<ProductionChart />
							</div>

							{/* Animal Distribution */}
							<div className="xl:col-span-1 order-2 xl:order-3">
								<AnimalDistribution />
							</div>

							{/* Health Overview */}
							<div className="lg:col-span-1 order-3 xl:order-2">
								<HealthOverview />
							</div>

							{/* Tasks Overview */}
							<div className="lg:col-span-1 order-4">
								<TasksOverview />
							</div>

							{/* Recent Activities */}
							<div className="lg:col-span-2 xl:col-span-1 order-5">
								<RecentActivities />
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	)
}

export default memo(Dashboard)
