import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDashboardData } from '@/hooks/dashboard/useDashboardData'

export const AnimalDistribution = memo(() => {
	const { t } = useTranslation(['dashboard'])
	const { animalDistribution, loading, loadingTertiary } = useDashboardData()

	const chartData = useMemo(() => {
		if (!animalDistribution?.length) return []

		const total = animalDistribution.reduce((sum, item) => sum + item.count, 0)
		let currentAngle = 0

		return animalDistribution.map((item, index) => {
			const percentage = (item.count / total) * 100
			const angle = (item.count / total) * 360
			const startAngle = currentAngle
			currentAngle += angle

			return {
				...item,
				percentage: Math.round(percentage),
				angle,
				startAngle,
				color: `hsl(${index * 60}, 70%, 50%)`,
			}
		})
	}, [animalDistribution])

	if (loading || loadingTertiary) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
					<div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto w-48" />
				</div>
			</div>
		)
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('charts.animalDistribution')}</h3>

			<div className="flex flex-col items-center">
				{/* Simple Donut Chart */}
				<div className="relative w-48 h-48 mb-6">
					<svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
						<title>{t('charts.animalDistribution')}</title>
						<circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6 dark:#374151" strokeWidth="8" className="stroke-gray-200 dark:stroke-gray-600" />
						{chartData.map((item, index) => {
							const circumference = 2 * Math.PI * 40
							const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`
							const strokeDashoffset = -((item.startAngle / 360) * circumference)

							return (
								<circle
									key={index}
									cx="50"
									cy="50"
									r="40"
									fill="none"
									stroke={item.color}
									strokeWidth="8"
									strokeDasharray={strokeDasharray}
									strokeDashoffset={strokeDashoffset}
									className="transition-all duration-500"
								/>
							)
						})}
					</svg>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-center">
							<div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
								{chartData.reduce((sum, item) => sum + item.count, 0)}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">{t('charts.totalAnimals')}</div>
						</div>
					</div>
				</div>

				{/* Legend */}
				<div className="space-y-2 w-full">
					{chartData.map((item, index) => (
						<div key={index} className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
								<span className="text-sm text-gray-700 dark:text-gray-300">{item.species}</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.count}</span>
								<span className="text-xs text-gray-500 dark:text-gray-400">({item.percentage}%)</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
})
