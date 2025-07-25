import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDashboardData } from '@/hooks/dashboard/useDashboardData'

export const HealthOverview = memo(() => {
	const { t } = useTranslation(['dashboard'])
	const { healthOverview, loading } = useDashboardData()

	if (loading) {
		return (
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
					<div className="space-y-3">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="h-4 bg-gray-200 rounded" />
						))}
					</div>
				</div>
			</div>
		)
	}

	const healthItems = [
		{
			label: t('health.healthy'),
			count: healthOverview.healthy,
			color: 'bg-green-500',
			textColor: 'text-green-700',
			bgColor: 'bg-green-50',
		},
		{
			label: t('health.sick'),
			count: healthOverview.sick,
			color: 'bg-red-500',
			textColor: 'text-red-700',
			bgColor: 'bg-red-50',
		},
		{
			label: t('health.treatment'),
			count: healthOverview.inTreatment,
			color: 'bg-yellow-500',
			textColor: 'text-yellow-700',
			bgColor: 'bg-yellow-50',
		},
		{
			label: t('health.checkupDue'),
			count: healthOverview.checkupDue,
			color: 'bg-blue-500',
			textColor: 'text-blue-700',
			bgColor: 'bg-blue-50',
		},
	]

	return (
		<div className="bg-white rounded-xl border border-gray-200 p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-6">{t('health.title')}</h3>

			<div className="space-y-4">
				{healthItems.map((item, index) => (
					<div key={index} className={`p-4 rounded-lg ${item.bgColor}`}>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className={`w-3 h-3 rounded-full ${item.color}`} />
								<span className={`font-medium ${item.textColor}`}>{item.label}</span>
							</div>
							<span className={`text-xl font-bold ${item.textColor}`}>{item.count}</span>
						</div>
					</div>
				))}
			</div>

			<div className="mt-6 pt-4 border-t border-gray-100">
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600">{t('health.totalAnimals')}</span>
					<span className="text-lg font-semibold text-gray-900">
						{healthItems.reduce((sum, item) => sum + item.count, 0)}
					</span>
				</div>
			</div>
		</div>
	)
})
