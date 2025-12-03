import { memo } from 'react'

import { cn } from '@/utils/cn'

export interface StatItem {
	value: number | string
	label: string
	variant?: 'default' | 'success' | 'warning' | 'info'
}

export interface PageHeaderStatsProps {
	stats: StatItem[]
}

const variantClasses = {
	default: 'bg-white/10 dark:bg-white/15 border-white/20 dark:border-white/25',
	success: 'bg-green-500/20 dark:bg-green-500/25 border-green-400/30 dark:border-green-400/35',
	warning: 'bg-yellow-500/20 dark:bg-yellow-500/25 border-yellow-400/30 dark:border-yellow-400/35',
	info: 'bg-blue-500/20 dark:bg-blue-500/25 border-blue-400/30 dark:border-blue-400/35',
}

export const PageHeaderStats = memo(({ stats }: PageHeaderStatsProps) => {
	return (
		<>
			{stats.map((stat, index) => (
				<div
					key={index}
					className={cn(
						'backdrop-blur-sm rounded-lg px-2 sm:px-3 py-2 text-center border',
						variantClasses[stat.variant || 'default']
					)}
				>
					<div className="text-lg sm:text-xl font-bold text-white">{stat.value}</div>
					<div className="text-xs text-blue-100 dark:text-blue-200">{stat.label}</div>
				</div>
			))}
		</>
	)
})

PageHeaderStats.displayName = 'PageHeaderStats'
