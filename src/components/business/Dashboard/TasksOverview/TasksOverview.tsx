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
		<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300">
			{/* Background enhancement */}
			<div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 dark:to-gray-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

			<div className="relative z-10">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-50 transition-colors">
						{t('tasks.title')}
					</h3>
					<div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs font-medium text-orange-700 dark:text-orange-400">
						<i className="i-material-symbols-schedule w-3! h-3!" />
						Active Tasks
					</div>
				</div>

				<div className="space-y-4">
					{taskItems.map((item, index) => (
						<div
							key={index}
							className={`p-4 rounded-xl border-2 ${item.bgColor} ${item.borderColor} hover:scale-[1.02] transition-all duration-300 cursor-pointer group/item hover:shadow-sm`}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div
										className={`w-10! h-10! ${item.icon} ${item.iconColor} group-hover/item:scale-110 transition-transform duration-300`}
									/>
									<div>
										<div
											className={`font-medium ${item.color} group-hover/item:font-semibold transition-all`}
										>
											{item.label}
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-300 group-hover/item:text-gray-700 dark:group-hover/item:text-gray-200 transition-colors">
											{item.count} {t('tasks.tasks')}
										</div>
									</div>
								</div>
								<div
									className={`text-2xl font-bold ${item.color} tabular-nums group-hover/item:scale-110 transition-transform duration-300`}
								>
									{item.count}
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="mt-6">
					<div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600 group-hover:from-gray-100 dark:group-hover:from-gray-600 transition-all duration-300">
						<div className="flex items-center gap-2">
							<i className="i-material-symbols-analytics w-5! h-5! bg-gray-600! dark:bg-gray-400!" />
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								{t('tasks.completionRate')}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-16 h-2 bg-gray-200 dark:bg-gray-500 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000"
									style={{
										width: `${
											Math.round(
												(tasksOverview.completed /
													(tasksOverview.pending +
														tasksOverview.inProgress +
														tasksOverview.completed)) *
													100
											) || 0
										}%`,
									}}
								/>
							</div>
							<span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
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
			</div>
		</div>
	)
})
