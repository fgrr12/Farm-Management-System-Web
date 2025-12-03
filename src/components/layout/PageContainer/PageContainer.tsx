import { memo, type ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface PageContainerProps {
	children: ReactNode
	className?: string
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl'
}

const maxWidthClasses = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-lg',
	xl: 'max-w-xl',
	'2xl': 'max-w-2xl',
	'4xl': 'max-w-4xl',
	'7xl': 'max-w-7xl',
}

export const PageContainer = memo(
	({ children, className, maxWidth = '7xl' }: PageContainerProps) => {
		return (
			<div className="min-h-screen md:min-h-full bg-linear-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
				<div
					className={cn(maxWidthClasses[maxWidth], 'mx-auto p-3 sm:p-4 lg:p-6 xl:p-8', className)}
				>
					{children}
				</div>
			</div>
		)
	}
)

PageContainer.displayName = 'PageContainer'
