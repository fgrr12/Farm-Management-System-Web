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
		<div className="flex flex-col w-full h-full p-4 gap-6 overflow-auto bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			{/* Header */}
			<header className="flex flex-col gap-2">
				<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
					{t('title')}
				</h1>
				<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
			</header>

			{/* Stats Cards */}
			<DashboardStats />

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{/* Production Chart - Takes 2 columns on xl screens */}
				<div className="xl:col-span-2">
					<ProductionChart />
				</div>

				{/* Animal Distribution */}
				<div className="xl:col-span-1">
					<AnimalDistribution />
				</div>

				{/* Health Overview */}
				<div className="lg:col-span-1">
					<HealthOverview />
				</div>

				{/* Tasks Overview */}
				<div className="lg:col-span-1">
					<TasksOverview />
				</div>

				{/* Recent Activities - Takes full width on lg+ */}
				<div className="lg:col-span-2 xl:col-span-1">
					<RecentActivities />
				</div>
			</div>
		</div>
	)
}

export default memo(Dashboard)
