import { memo } from 'react'
import { useTranslation } from 'react-i18next'

interface StatCardProps {
	title: string
	value: string | number
	change?: number
	icon: string
	color: 'blue' | 'green' | 'orange' | 'purple'
	loading?: boolean
}

const colorClasses = {
	blue: {
		bg: 'bg-blue-50',
		icon: 'bg-blue-600!',
		change: 'text-blue-600',
	},
	green: {
		bg: 'bg-green-50',
		icon: 'bg-green-600!',
		change: 'text-green-600',
	},
	orange: {
		bg: 'bg-orange-50',
		icon: 'bg-orange-600!',
		change: 'text-orange-600',
	},
	purple: {
		bg: 'bg-purple-50',
		icon: 'bg-purple-600!',
		change: 'text-purple-600',
	},
}

export const StatCard = memo<StatCardProps>(
	({ title, value, change, icon, color, loading = false }) => {
		const { t } = useTranslation('dashboard')
		const colors = colorClasses[color]
		const isPositive = change && change > 0
		const isNegative = change && change < 0

		if (loading) {
			return (
				<div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<div className="h-4 bg-gray-200 rounded w-24 mb-2" />
							<div className="h-8 bg-gray-200 rounded w-16 mb-2" />
							<div className="flex items-center mt-2">
								<div className="h-4 bg-gray-200 rounded w-12" />
								<div className="h-3 bg-gray-200 rounded w-20 ml-2" />
							</div>
						</div>
						<div className={`p-3 rounded-lg ${colors.bg}`}>
							<div className="w-6 h-6 bg-gray-200 rounded" />
						</div>
					</div>
				</div>
			)
		}

		return (
			<div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
						<p className="text-2xl font-bold text-gray-900">{value}</p>
						{change !== undefined && change !== null && (
							<div className="flex items-center mt-2">
								<span
									className={`text-sm font-medium ${
										isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
									}`}
								>
									{isPositive && '+'}
									{change}%
								</span>
								<span className="text-xs text-gray-500 ml-1">{t('common.vsLastMonth')}</span>
							</div>
						)}
					</div>
					<div className={`p-3 rounded-lg ${colors.bg}`}>
						<i className={`w-6! h-6! ${icon} ${colors.icon}`} />
					</div>
				</div>
			</div>
		)
	}
)
