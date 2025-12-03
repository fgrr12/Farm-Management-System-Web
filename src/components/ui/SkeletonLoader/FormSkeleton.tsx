import { memo } from 'react'

import { cn } from '@/utils/cn'

export interface FormSkeletonProps {
	sections?: number
	fieldsPerSection?: number
	hasSidebar?: boolean
	className?: string
}

export const FormSkeleton = memo(
	({ sections = 3, fieldsPerSection = 4, hasSidebar = false, className }: FormSkeletonProps) => {
		return (
			<div
				className={cn(
					'bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700',
					className
				)}
			>
				<div
					className={cn('grid gap-6', hasSidebar ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1')}
				>
					{/* Sidebar Skeleton */}
					{hasSidebar && (
						<div className="lg:col-span-1">
							<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
								<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse" />
								<div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
							</div>
						</div>
					)}

					{/* Sections Skeleton */}
					<div className={cn('space-y-6', hasSidebar ? 'lg:col-span-2' : 'lg:col-span-1')}>
						{Array.from({ length: sections }).map((_, sectionIndex) => (
							<div
								key={sectionIndex}
								className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600"
							>
								{/* Section Title */}
								<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse" />

								{/* Fields Grid */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{Array.from({ length: fieldsPerSection }).map((_, fieldIndex) => (
										<div key={fieldIndex} className="space-y-2">
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
											<div
												className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
												style={{
													animationDelay: `${(sectionIndex * fieldsPerSection + fieldIndex) * 50}ms`,
												}}
											/>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Submit Button Skeleton */}
				<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
					<div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full sm:w-48 animate-pulse" />
				</div>
			</div>
		)
	}
)

FormSkeleton.displayName = 'FormSkeleton'
