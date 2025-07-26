import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDashboardData } from '@/hooks/dashboard/useDashboardData'

import { StatCard } from './StatCard'

export const DashboardStats = memo(() => {
	const { t } = useTranslation(['dashboard'])
	const { stats, loading, loadingSecondary } = useDashboardData()

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<StatCard
				title={t('stats.totalAnimals')}
				value={stats.totalAnimals}
				change={stats.animalsChange}
				icon="i-material-symbols-pets"
				color="blue"
				loading={loading}
			/>
			<StatCard
				title={t('stats.healthyAnimals')}
				value={stats.healthyAnimals}
				change={stats.healthChange}
				icon="i-material-symbols-favorite"
				color="green"
				loading={loading || loadingSecondary} // Shows loading until accurate health data is loaded
			/>
			<StatCard
				title={t('stats.pendingTasks')}
				value={stats.pendingTasks}
				change={stats.tasksChange}
				icon="i-material-symbols-task-alt"
				color="orange"
				loading={loading || loadingSecondary} // Shows loading until accurate task data is loaded
			/>
			<StatCard
				title={t('stats.monthlyProduction')}
				value={`${stats.monthlyProduction}L`}
				change={stats.productionChange}
				icon="i-material-symbols-water-drop"
				color="purple"
				loading={loading}
				// Production change loads in secondary phase but initial value loads immediately
				changeLoading={loadingSecondary && !stats.productionChange}
			/>
		</div>
	)
})
