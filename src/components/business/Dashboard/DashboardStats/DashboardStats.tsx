import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDashboardData } from '@/hooks/dashboard/useDashboardData'

import { StatCard } from './StatCard'

export const DashboardStats = memo(() => {
	const { t } = useTranslation(['dashboard'])
	const { stats, loading } = useDashboardData()

	if (loading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} className="animate-pulse">
						<div className="bg-white rounded-xl border border-gray-200 p-6 h-32" />
					</div>
				))}
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<StatCard
				title={t('stats.totalAnimals')}
				value={stats.totalAnimals}
				change={stats.animalsChange}
				icon="i-material-symbols-pets"
				color="blue"
			/>
			<StatCard
				title={t('stats.healthyAnimals')}
				value={stats.healthyAnimals}
				change={stats.healthChange}
				icon="i-material-symbols-favorite"
				color="green"
			/>
			<StatCard
				title={t('stats.pendingTasks')}
				value={stats.pendingTasks}
				change={stats.tasksChange}
				icon="i-material-symbols-task-alt"
				color="orange"
			/>
			<StatCard
				title={t('stats.monthlyProduction')}
				value={`${stats.monthlyProduction}L`}
				change={stats.productionChange}
				icon="i-material-symbols-water-drop"
				color="purple"
			/>
		</div>
	)
})
