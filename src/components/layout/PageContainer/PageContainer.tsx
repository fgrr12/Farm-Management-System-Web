import { memo, type ReactNode, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

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
		const location = useLocation()

		const blobColors = useMemo(() => {
			const path = location.pathname

			if (path.includes(AppRoutes.ANIMALS)) {
				return ['bg-blue-500/30', 'bg-cyan-500/30', 'bg-indigo-500/30']
			}
			if (path.includes(AppRoutes.TASKS)) {
				return ['bg-green-500/30', 'bg-emerald-500/30', 'bg-teal-500/30']
			}
			if (path.includes(AppRoutes.MY_SPECIES)) {
				return ['bg-indigo-500/30', 'bg-violet-500/30', 'bg-blue-500/30']
			}
			if (path.includes(AppRoutes.EMPLOYEES)) {
				return ['bg-orange-500/30', 'bg-amber-500/30', 'bg-red-500/30']
			}
			if (path.includes(AppRoutes.TAX_DETAILS)) {
				return ['bg-indigo-500/30', 'bg-blue-500/30', 'bg-purple-500/30']
			}
			if (path.includes(AppRoutes.MY_ACCOUNT)) {
				return ['bg-gray-500/30', 'bg-slate-500/30', 'bg-zinc-500/30']
			}
			if (path.includes(AppRoutes.DASHBOARD)) {
				return ['bg-cyan-500/30', 'bg-sky-500/30', 'bg-teal-500/30']
			}
			if (path.includes(AppRoutes.CALENDAR)) {
				return ['bg-purple-500/30', 'bg-fuchsia-500/30', 'bg-indigo-500/30']
			}
			if (path.includes(AppRoutes.VOICE)) {
				return ['bg-pink-500/30', 'bg-rose-500/30', 'bg-purple-500/30']
			}
			// Default
			return ['bg-blue-500/30', 'bg-purple-500/30', 'bg-indigo-500/30']
		}, [location.pathname])

		return (
			<div className="min-h-screen md:min-h-full relative overflow-hidden bg-slate-900 transition-colors duration-300">
				{/* Global Organic Background Blobs */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div
						className={cn(
							'absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] opacity-50 animate-blob transition-colors duration-1000',
							blobColors[0]
						)}
					/>
					<div
						className={cn(
							'absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] opacity-50 animate-blob animation-delay-2000 transition-colors duration-1000',
							blobColors[1]
						)}
					/>
					<div
						className={cn(
							'absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[120px] opacity-50 animate-blob animation-delay-4000 transition-colors duration-1000',
							blobColors[2]
						)}
					/>
				</div>

				<div
					className={cn(
						maxWidthClasses[maxWidth],
						'mx-auto p-3 sm:p-4 lg:p-6 xl:p-8 relative z-10',
						className
					)}
				>
					{children}
				</div>
			</div>
		)
	}
)

PageContainer.displayName = 'PageContainer'
