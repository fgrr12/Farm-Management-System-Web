import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDashboardData } from '@/hooks/dashboard/useDashboardData'

export const TasksOverview = memo(() => {
	const { t } = useTranslation(['dashboard'])
	const { tasksOverview, loading, loadingSecondary } = useDashboardData()

	if (loading || loadingSecondary) {
		return (
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<div key={index} className="h-16 bg-gray-200 rounded" />
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
			color: 'text-orange-600',
			iconColor: 'bg-orange-600!',
			bgColor: 'bg-orange-50',
			borderColor: 'border-orange-200',
		},
		{
			label: t('tasks.inProgress'),
			count: tasksOverview.inProgress,
			icon: 'i-material-symbols-play-circle',
			color: 'text-blue-600',
			iconColor: 'bg-blue-600!',
			bgColor: 'bg-blue-50',
			borderColor: 'border-blue-200',
		},
		{
			label: t('tasks.completed'),
			count: tasksOverview.completed,
			icon: 'i-material-symbols-check-circle',
			color: 'text-green-600',
			iconColor: 'bg-green-600!',
			bgColor: 'bg-green-50',
			borderColor: 'border-green-200',
		},
	]

	return (
		<div className="bg-white rounded-xl border border-gray-200 p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-6">{t('tasks.title')}</h3>

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
									<div className="text-sm text-gray-600">
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
				<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
					<span className="text-sm font-medium text-gray-700">{t('tasks.completionRate')}</span>
					<span className="text-lg font-bold text-gray-900">
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
