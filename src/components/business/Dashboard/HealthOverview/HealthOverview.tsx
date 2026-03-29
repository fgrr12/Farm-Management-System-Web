import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { animateValue } from '@/utils/animateValue'

import { useDashboardData } from '@/hooks/dashboard/useDashboardData'

export const HealthOverview = memo(() => {
	const { t } = useTranslation(['dashboard'])
	const { healthOverview, loading, loadingSecondary } = useDashboardData()

	const [displayCounts, setDisplayCounts] = useState<number[]>([0, 0, 0, 0])
	const [displayTotal, setDisplayTotal] = useState(0)

	const healthItems = [
		{
			label: t('health.healthy'),
			count: healthOverview.healthy,
			color: 'bg-green-500',
			textColor: 'text-green-700 dark:text-green-400',
			bgColor: 'bg-green-50 dark:bg-green-900/20',
			hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900/30',
			icon: 'i-material-symbols-favorite',
			iconColor: 'bg-green-600! dark:bg-green-500!',
		},
		{
			label: t('health.sick'),
			count: healthOverview.sick,
			color: 'bg-red-500',
			textColor: 'text-red-700 dark:text-red-400',
			bgColor: 'bg-red-50 dark:bg-red-900/20',
			hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/30',
			icon: 'i-material-symbols-sick',
			iconColor: 'bg-red-600! dark:bg-red-500!',
		},
		{
			label: t('health.treatment'),
			count: healthOverview.inTreatment,
			color: 'bg-yellow-500',
			textColor: 'text-yellow-700 dark:text-yellow-400',
			bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
			hoverBg: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
			icon: 'i-material-symbols-medication',
			iconColor: 'bg-yellow-600! dark:bg-yellow-500!',
		},
		{
			label: t('health.checkupDue'),
			count: healthOverview.checkupDue,
			color: 'bg-blue-500',
			textColor: 'text-blue-700 dark:text-blue-400',
			bgColor: 'bg-blue-50 dark:bg-blue-900/20',
			hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
			icon: 'i-material-symbols-schedule',
			iconColor: 'bg-blue-600! dark:bg-blue-500!',
		},
	]

	// Animate counters
	useEffect(() => {
		if (loading || loadingSecondary) return

		const cancels: (() => void)[] = []

		healthItems.forEach((item, index) => {
			cancels.push(
				animateValue(0, item.count, 1200, (v) => {
					setDisplayCounts((prev) => {
						const newCounts = [...prev]
						newCounts[index] = v
						return newCounts
					})
				})
			)
		})

		const totalValue = healthItems.reduce((sum, item) => sum + item.count, 0)
		cancels.push(animateValue(0, totalValue, 1500, setDisplayTotal))

		return () => cancels.forEach((c) => c())
	}, [loading, loadingSecondary, healthOverview])

	return (
		<div
			className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg dark:hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
			role="region"
			aria-label="Health Overview"
		>
			{/* Content container */}
			<div className="relative z-10">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
					{t('health.title')}
				</h3>

				<div className="space-y-3">
					{healthItems.map((item, index) => {
						return (
							<div
								key={index}
								className={`p-4 rounded-lg ${item.bgColor} ${item.hoverBg} transition-all duration-200 cursor-pointer group animate-fade-in-left`}
								style={{ animationDelay: `${index * 100}ms` }}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="relative">
											<div
												className={`w-3 h-3 rounded-full ${item.color} group-hover:scale-110 transition-transform`}
											/>
											<div
												className={`absolute inset-0 w-3 h-3 rounded-full ${item.color} opacity-30 group-hover:scale-150 transition-transform`}
											/>
										</div>
										<i
											className={`${item.icon} w-4! h-4! ${item.iconColor} group-hover:scale-110 transition-transform`}
										/>
										<span
											className={`font-medium ${item.textColor} group-hover:font-semibold transition-all`}
										>
											{item.label}
										</span>
									</div>
									<span
										className={`text-xl font-bold ${item.textColor} tabular-nums group-hover:scale-105 transition-transform`}
									>
										{loading || loadingSecondary ? '...' : displayCounts[index]}
									</span>
								</div>
							</div>
						)
					})}
				</div>

				<div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
							{t('health.totalAnimals')}
						</span>
						<span className="text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
							{loading || loadingSecondary ? '...' : displayTotal}
						</span>
					</div>
				</div>
			</div>
		</div>
	)
})
