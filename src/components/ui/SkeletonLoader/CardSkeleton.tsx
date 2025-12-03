import { memo } from 'react'

import { cn } from '@/utils/cn'

export interface CardSkeletonProps {
	count?: number
	className?: string
}

export const CardSkeleton = memo(({ count = 8, className }: CardSkeletonProps) => {
	return (
		<>
			{Array.from({ length: count }).map((_, index) => (
				<div
					key={index}
					className={cn(
						'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse',
						className
					)}
				>
					{/* Image placeholder */}
					<div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />

					{/* Title placeholder */}
					<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />

					{/* Subtitle placeholder */}
					<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />

					{/* Tags placeholder */}
					<div className="flex gap-2">
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
					</div>
				</div>
			))}
		</>
	)
})

CardSkeleton.displayName = 'CardSkeleton'
