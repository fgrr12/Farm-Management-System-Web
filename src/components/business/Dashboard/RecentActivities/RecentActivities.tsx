import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDashboardData } from '@/hooks/dashboard/useDashboardData'

export const RecentActivities = memo(() => {
	const { t } = useTranslation(['dashboard'])
	const { recentActivities, loading, loadingTertiary } = useDashboardData()

	if (loading || loadingTertiary) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, index) => (
							<div key={index} className="flex items-center gap-3">
								<div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
								<div className="flex-1">
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		)
	}

	const getActivityIcon = (type: string) => {
		switch (type) {
			case 'health_record':
				return 'i-material-symbols-medical-services'
			case 'production_record':
				return 'i-material-symbols-water-drop'
			case 'task_completed':
				return 'i-material-symbols-task-alt'
			case 'animal_added':
				return 'i-material-symbols-pets'
			default:
				return 'i-material-symbols-info'
		}
	}

	const getActivityColor = (type: string) => {
		switch (type) {
			case 'health_record':
				return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
			case 'production_record':
				return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
			case 'task_completed':
				return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
			case 'animal_added':
				return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
			default:
				return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800'
		}
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
				{t('activities.title')}
			</h3>

			<div className="space-y-4 max-h-80 overflow-y-auto">
				{recentActivities.map((activity, index) => (
					<div
						key={index}
						className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
					>
						<div
							className={`flex justify-center items-center p-2 rounded-full ${getActivityColor(activity.type)}`}
						>
							<div className={`w-4! h-4! ${getActivityIcon(activity.type)}`} />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
								{activity.title}
							</p>
							<p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
								{activity.description}
							</p>
							<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
								<span>{activity.time}</span>
								<span>•</span>
								<span>{activity.user}</span>
							</div>
						</div>
					</div>
				))}
			</div>

			{recentActivities.length === 0 && (
				<div className="text-center py-8">
					<div className="w-12! h-12! i-material-symbols-history text-gray-400 dark:text-gray-500 mx-auto mb-3" />
					<p className="text-gray-500 dark:text-gray-400">{t('activities.noActivities')}</p>
				</div>
			)}
		</div>
	)
})
