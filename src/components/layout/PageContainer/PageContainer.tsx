import { memo, type ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface PageContainerProps {
	children: ReactNode
	className?: string
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '7xl'
}

const maxWidthClasses = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-lg',
	xl: 'max-w-xl',
	'2xl': 'max-w-2xl',
	'3xl': 'max-w-3xl',
	'4xl': 'max-w-4xl',
	'5xl': 'max-w-5xl',
	'7xl': 'max-w-7xl',
}

export const PageContainer = memo(
	({ children, className, maxWidth = '7xl' }: PageContainerProps) => {
		return (
			<div
				className={cn(
					maxWidthClasses[maxWidth],
					'mx-auto p-3 sm:p-4 lg:p-6 xl:p-8 relative',
					className
				)}
			>
				{children}
			</div>
		)
	}
)

PageContainer.displayName = 'PageContainer'
