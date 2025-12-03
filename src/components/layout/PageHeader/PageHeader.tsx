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
					'relative overflow-hidden rounded-3xl transition-all duration-300 mb-8',
					'bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl',
					className
				)}
			>
				{/* Glass Reflection Overlay */}
				<div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />

				{/* Hero Section */}
				<div className="px-6 py-8 sm:px-8 sm:py-10 relative z-10">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
						{/* Title Section */}
						<div className="flex items-center gap-5">
							<div
								className={cn(
									'rounded-2xl flex items-center justify-center shrink-0 shadow-lg backdrop-blur-md border border-white/20',
									'bg-white/10 text-white',
									isCompact ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-16 h-16 sm:w-20 sm:h-20'
								)}
							>
								<i
									className={cn(
										`i-material-symbols-${icon} drop-shadow-md`,
										isCompact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
									)}
								/>
							</div>
							<div className="min-w-0">
								<h1
									className={cn(
										'font-bold text-white drop-shadow-md tracking-tight',
										isCompact
											? 'text-xl sm:text-2xl lg:text-3xl'
											: 'text-3xl sm:text-4xl lg:text-5xl'
									)}
								>
									{title}
								</h1>
								{subtitle && (
									<p className="text-blue-100/80 text-base sm:text-lg mt-2 font-medium tracking-wide">
										{subtitle}
									</p>
								)}
							</div>
						</div>

						{/* Stats Section */}
						{stats && <div className="flex gap-3 sm:gap-4">{stats}</div>}
					</div>
				</div>

				{/* Actions Section */}
				{actions && (
					<div className="p-4 sm:p-6 bg-black/20 border-t border-white/5 relative z-10 backdrop-blur-md">
						{actions}
					</div>
				)}
			</div>
		)
	}
)

PageHeader.displayName = 'PageHeader'
