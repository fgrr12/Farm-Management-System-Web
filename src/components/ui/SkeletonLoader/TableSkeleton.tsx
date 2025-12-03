import { memo } from 'react'

import { cn } from '@/utils/cn'

export interface TableSkeletonProps {
	rows?: number
	columns?: number
	className?: string
}

export const TableSkeleton = memo(({ rows = 5, columns = 5, className }: TableSkeletonProps) => {
	return (
		<div className={cn('w-full overflow-hidden', className)}>
			{/* Table Header */}
			<div className="bg-gray-100 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
				<div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
					{Array.from({ length: columns }).map((_, index) => (
						<div key={index} className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
					))}
				</div>
			</div>

			{/* Table Rows */}
			{Array.from({ length: rows }).map((_, rowIndex) => (
				<div
					key={rowIndex}
					className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
				>
					<div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
						{Array.from({ length: columns }).map((_, colIndex) => (
							<div
								key={colIndex}
								className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
								style={{ animationDelay: `${(rowIndex * columns + colIndex) * 50}ms` }}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	)
})

TableSkeleton.displayName = 'TableSkeleton'
