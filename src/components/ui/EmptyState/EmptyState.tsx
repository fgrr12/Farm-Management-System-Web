import { memo } from 'react'

import { cn } from '@/utils/cn'

import { Button } from '@/components/ui/Button'

export interface EmptyStateProps {
	icon: string
	title: string
	description: string
	action?: {
		label: string
		onClick: () => void
		icon?: string
	}
	className?: string
}

export const EmptyState = memo(
	({ icon, title, description, action, className }: EmptyStateProps) => {
		return (
			<div
				className={cn(
					'bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700',
					className
				)}
			>
				<div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
					<div
						className="flex flex-col items-center justify-center gap-4 sm:gap-6"
						role="status"
						aria-live="polite"
					>
						{/* Icon */}
						<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600">
							<i
								className={`i-material-symbols-${icon} w-8! h-8! sm:w-10 sm:h-10 bg-gray-400 dark:bg-gray-500!`}
							/>
						</div>

						{/* Text */}
						<div className="space-y-2">
							<h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
								{title}
							</h3>
							<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
								{description}
							</p>
						</div>

						{/* Action Button */}
						{action && (
							<Button type="button" className="btn btn-primary mt-4" onClick={action.onClick}>
								{action.icon && (
									<i className={`i-material-symbols-${action.icon} w-6! h-6! mr-2`} />
								)}
								{action.label}
							</Button>
						)}
					</div>
				</div>
			</div>
		)
	}
)

EmptyState.displayName = 'EmptyState'
