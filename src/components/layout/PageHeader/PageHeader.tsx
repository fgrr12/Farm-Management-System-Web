import { memo, type ReactNode } from 'react'

import { cn } from '@/utils/cn'

export interface PageHeaderProps {
	icon: string
	title: string
	subtitle?: string
	stats?: ReactNode
	actions?: ReactNode
	variant?: 'default' | 'compact'
	className?: string
}

export const PageHeader = memo(
	({ icon, title, subtitle, stats, actions, variant = 'default', className }: PageHeaderProps) => {
		const isCompact = variant === 'compact'

		return (
			<div
				className={cn(
					'bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300',
					className
				)}
			>
				{/* Hero Section */}
				<div className="bg-linear-to-r from-blue-600 to-green-600 dark:from-blue-700 dark:to-green-700 px-4 sm:px-6 py-6 sm:py-8">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						{/* Title Section */}
						<div className="flex items-center gap-3 sm:gap-4">
							<div
								className={cn(
									'bg-white/20 dark:bg-white/25 rounded-full flex items-center justify-center shrink-0 shadow-lg dark:shadow-black/20 backdrop-blur-sm',
									isCompact ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-12 h-12 sm:w-16 sm:h-16'
								)}
							>
								<i
									className={cn(
										`i-material-symbols-${icon} bg-white! drop-shadow-sm`,
										isCompact ? 'w-6! h-6! sm:w-7 sm:h-7' : 'w-6! h-6! sm:w-8 sm:h-8'
									)}
								/>
							</div>
							<div className="min-w-0">
								<h1
									className={cn(
										'font-bold text-white drop-shadow-sm',
										isCompact
											? 'text-xl sm:text-2xl lg:text-3xl'
											: 'text-2xl sm:text-3xl lg:text-4xl'
									)}
								>
									{title}
								</h1>
								{subtitle && (
									<p className="text-blue-100 dark:text-blue-200 text-sm sm:text-base mt-1 drop-shadow-sm">
										{subtitle}
									</p>
								)}
							</div>
						</div>

						{/* Stats Section */}
						{stats && <div className="flex gap-2 sm:gap-3">{stats}</div>}
					</div>
				</div>

				{/* Actions Section */}
				{actions && (
					<div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
						{actions}
					</div>
				)}
			</div>
		)
	}
)

PageHeader.displayName = 'PageHeader'
