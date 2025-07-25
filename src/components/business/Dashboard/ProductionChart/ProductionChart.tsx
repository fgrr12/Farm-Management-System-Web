import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDashboardData } from '@/hooks/dashboard/useDashboardData'

export const ProductionChart = memo(() => {
	const { t } = useTranslation(['dashboard'])
	const { productionData, loading } = useDashboardData()

	const chartData = useMemo(() => {
		if (!productionData?.length) return []

		const maxValue = Math.max(...productionData.map((d) => d.value))
		return productionData.map((item) => ({
			...item,
			percentage: (item.value / maxValue) * 100,
		}))
	}, [productionData])

	if (loading) {
		return (
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
					<div className="h-64 bg-gray-200 rounded" />
				</div>
			</div>
		)
	}

	return (
		<div className="bg-white rounded-xl border border-gray-200 p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-gray-900">{t('charts.productionTrend')}</h3>
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-2">
						<i className="i-material-symbols-water-drop w-6! h-6! bg-blue-500!" />
						<span className="text-sm text-gray-600">{t('charts.production')}</span>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				{chartData.map((item, index) => (
					<div key={index} className="flex items-center gap-4">
						<div className="w-16 text-sm text-gray-600 font-medium">{item.month}</div>
						<div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
							<div
								className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-3"
								style={{ width: `${item.percentage}%` }}
							>
								<span className="text-white text-sm font-medium">{item.value}L</span>
							</div>
						</div>
						<div className="w-16 text-sm text-gray-900 font-semibold text-right">{item.value}L</div>
					</div>
				))}
			</div>

			<div className="mt-6 pt-4 border-t border-gray-100">
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600">{t('charts.totalProduction')}</span>
					<span className="font-semibold text-gray-900">
						{chartData.reduce((sum, item) => sum + item.value, 0)}L
					</span>
				</div>
			</div>
		</div>
	)
})
