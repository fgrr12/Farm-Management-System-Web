import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDashboardData } from '@/hooks/dashboard/useDashboardData'

export const TasksOverview = memo(() => {
	const { t } = useTranslation(['dashboard'])
	const { tasksOverview, loading, loadingSecondary } = useDashboardData()

	if (loading || loadingSecondary) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
						))}
					</div>
				</div>
			</div>
		)
	}

	const taskItems = [
		{
			label: t('tasks.pending'),
			count: tasksOverview.pending,
			icon: 'i-material-symbols-schedule',
			color: 'text-orange-600 dark:text-orange-400',
			iconColor: 'bg-orange-600! dark:bg-orange-500!',
			bgColor: 'bg-orange-50 dark:bg-orange-900/20',
			borderColor: 'border-orange-200 dark:border-orange-700/50',
		},
		{
			label: t('tasks.inProgress'),
			count: tasksOverview.inProgress,
			icon: 'i-material-symbols-play-circle',
			color: 'text-blue-600 dark:text-blue-400',
			iconColor: 'bg-blue-600! dark:bg-blue-500!',
			bgColor: 'bg-blue-50 dark:bg-blue-900/20',
			borderColor: 'border-blue-200 dark:border-blue-700/50',
		},
		{
			label: t('tasks.completed'),
			count: tasksOverview.completed,
			icon: 'i-material-symbols-check-circle',
			color: 'text-green-600 dark:text-green-400',
			iconColor: 'bg-green-600! dark:bg-green-500!',
			bgColor: 'bg-green-50 dark:bg-green-900/20',
			borderColor: 'border-green-200 dark:border-green-700/50',
		},
	]

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
				{t('tasks.title')}
			</h3>

			<div className="space-y-4">
				{taskItems.map((item, index) => (
					<div
						key={index}
						className={`p-4 rounded-lg border-2 ${item.bgColor} ${item.borderColor}`}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className={`w-8! h-8! ${item.icon} ${item.iconColor}`} />
								<div>
									<div className={`font-medium ${item.color}`}>{item.label}</div>
									<div className="text-sm text-gray-600 dark:text-gray-300">
										{item.count} {t('tasks.tasks')}
									</div>
								</div>
							</div>
							<div className={`text-2xl font-bold ${item.color}`}>{item.count}</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-6">
				<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
						{t('tasks.completionRate')}
					</span>
					<span className="text-lg font-bold text-gray-900 dark:text-white">
						{Math.round(
							(tasksOverview.completed /
								(tasksOverview.pending + tasksOverview.inProgress + tasksOverview.completed)) *
								100
						) || 0}
						%
					</span>
				</div>
			</div>
		</div>
	)
})
