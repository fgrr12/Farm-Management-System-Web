import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { animateValue } from '@/utils/animateValue'

interface StatCardProps {
	title: string
	value: string | number
	change?: number
	icon: string
	color: 'blue' | 'green' | 'orange' | 'purple'
	loading?: boolean
	changeLoading?: boolean
}

const colorClasses = {
	blue: {
		bg: 'bg-blue-50 dark:bg-blue-900/20',
		icon: 'bg-blue-600! dark:bg-blue-500!',
		change: 'text-blue-600 dark:text-blue-400',
	},
	green: {
		bg: 'bg-green-50 dark:bg-green-900/20',
		icon: 'bg-green-600! dark:bg-green-500!',
		change: 'text-green-600 dark:text-green-400',
	},
	orange: {
		bg: 'bg-orange-50 dark:bg-orange-900/20',
		icon: 'bg-orange-600! dark:bg-orange-500!',
		change: 'text-orange-600 dark:text-orange-400',
	},
	purple: {
		bg: 'bg-purple-50 dark:bg-purple-900/20',
		icon: 'bg-purple-600! dark:bg-purple-500!',
		change: 'text-purple-600 dark:text-purple-400',
	},
}

export const StatCard = memo<StatCardProps>(
	({ title, value, change, icon, color, loading = false, changeLoading = false }) => {
		const { t } = useTranslation('dashboard')
		const colors = colorClasses[color]

		const [displayValue, setDisplayValue] = useState<string | number>(0)
		const [displayChange, setDisplayChange] = useState<number>(0)

		// Extract numeric value for animation
		const numericValue =
			typeof value === 'string' ? Number.parseFloat(value.replace(/[^\d.-]/g, '')) || 0 : value || 0

		// Animate counter when value changes
		useEffect(() => {
			if (loading || numericValue === 0) return

			const hasSuffix = typeof value === 'string' && value.includes('L')
			const cancel = animateValue(0, numericValue, 1500, (v) => {
				setDisplayValue(hasSuffix ? `${v}L` : v)
			})
			return cancel
		}, [numericValue, loading, value])

		// Animate change percentage
		useEffect(() => {
			if (changeLoading || change === undefined || change === null) return

			const cancel = animateValue(0, change, 1000, (v) => {
				setDisplayChange(Math.round(v * 10) / 10)
			})
			return cancel
		}, [change, changeLoading])

		if (loading) {
			return (
				<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
							<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
							<div className="flex items-center mt-2">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
								<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-2" />
							</div>
						</div>
						<div className={`p-3 rounded-lg ${colors.bg}`}>
							<div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
						</div>
					</div>
				</div>
			)
		}

		return (
			<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg dark:hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up">
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<p className="text-base font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</p>
						<p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
							{loading ? '...' : displayValue}
						</p>
						{changeLoading ? (
							<div className="flex items-center mt-2">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
								<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-2 animate-pulse" />
							</div>
						) : (
							change !== undefined &&
							change !== null && (
								<div className="flex items-center mt-2">
									<span
										className={`text-sm font-medium tabular-nums ${
											displayChange > 0
												? 'text-green-600 dark:text-green-400'
												: displayChange < 0
													? 'text-red-600 dark:text-red-400'
													: 'text-gray-500 dark:text-gray-400'
										}`}
									>
										{displayChange > 0 && '+'}
										{displayChange}%
									</span>
									<span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
										{t('common.vsLastMonth')}
									</span>
								</div>
							)
						)}
					</div>
					<div className={`p-3 rounded-lg ${colors.bg} transition-all duration-300`}>
						<i className={`w-6! h-6! ${icon} ${colors.icon} animate-spin-in`} />
						{/* Pulse effect on hover */}
						<div
							className={`absolute inset-0 rounded-xl ${colors.bg} opacity-0 group-hover:opacity-50 group-hover:scale-150 transition-all duration-500`}
						/>
					</div>
				</div>
			</div>
		)
	}
)
