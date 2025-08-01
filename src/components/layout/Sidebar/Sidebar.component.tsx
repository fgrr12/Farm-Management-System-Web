import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { memo, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { useTheme } from '@/hooks/system/useTheme'

export const Sidebar = memo(() => {
	const { user } = useUserStore()
	const { billingCard } = useFarmStore()
	const { loading } = useAppStore()
	const navigate = useNavigate()
	const location = useLocation()
	const { theme, resolvedTheme, toggleTheme } = useTheme()

	const handleGoTo = useCallback(
		(path: string) => () => {
			if (location.pathname === path) return
			navigate(path)
		},
		[location.pathname, navigate]
	)

	const getButtonClasses = useCallback(
		(path: string, colorFrom: string, colorTo: string) => {
			const isActive = location.pathname.includes(path)
			return `w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
				isActive
					? `bg-gradient-to-br ${colorFrom} ${colorTo} shadow-lg`
					: 'hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-800'
			}`
		},
		[location.pathname]
	)

	const getIconClasses = useCallback(
		(path: string) => {
			const isActive = location.pathname.includes(path)
			return `w-6! h-6! ${isActive ? 'bg-white!' : 'bg-gray-600! dark:bg-gray-300!'}`
		},
		[location.pathname]
	)

	const showAdminRoutes = useMemo(
		() => user?.role === 'admin' || user?.role === 'owner',
		[user?.role]
	)

	const showBillingCard = useMemo(
		() => showAdminRoutes && billingCard !== null && billingCard.status,
		[showAdminRoutes, billingCard]
	)

	useGSAP(() => {
		if (loading) return
		gsap.fromTo(
			'.menu li, .divider',
			{ opacity: 0, y: 20, duration: 0, ease: 'power1.out' },
			{
				opacity: 1,
				y: 0,
				stagger: 0.05,
				duration: 0.2,
				ease: 'power1.out',
			}
		)
	}, [location])
	return (
		<div
			className="bg-white dark:bg-gray-900 h-full hidden lg:flex flex-col items-center py-4 shadow-lg border-r border-gray-100 dark:border-gray-700 w-20"
			role="navigation"
			aria-label="Main navigation"
		>
			{/* Main Navigation */}
			<div className="flex flex-col gap-3">
				<button
					type="button"
					className={getButtonClasses(AppRoutes.DASHBOARD, 'from-cyan-500', 'to-cyan-600')}
					onClick={handleGoTo(AppRoutes.DASHBOARD)}
					aria-label="Dashboard"
				>
					<i className={`i-material-symbols-dashboard ${getIconClasses(AppRoutes.DASHBOARD)}`} />
				</button>

				<button
					type="button"
					className={getButtonClasses(AppRoutes.ANIMALS, 'from-blue-500', 'to-blue-600')}
					onClick={handleGoTo(AppRoutes.ANIMALS)}
					aria-label="Animals"
				>
					<i className={`i-healthicons-animal-cow ${getIconClasses(AppRoutes.ANIMALS)}`} />
				</button>

				<button
					type="button"
					className={getButtonClasses(AppRoutes.TASKS, 'from-green-500', 'to-green-600')}
					onClick={handleGoTo(AppRoutes.TASKS)}
					aria-label="Tasks"
				>
					<i className={`i-fluent-tasks-app-24-filled ${getIconClasses(AppRoutes.TASKS)}`} />
				</button>

				<button
					type="button"
					className={getButtonClasses(AppRoutes.MY_SPECIES, 'from-purple-500', 'to-purple-600')}
					onClick={handleGoTo(AppRoutes.MY_SPECIES)}
					aria-label="My Species"
				>
					<i className={`i-solar-dna-bold-duotone ${getIconClasses(AppRoutes.MY_SPECIES)}`} />
				</button>
			</div>

			{/* Admin Section */}
			{showAdminRoutes && (
				<>
					<div className="w-8 h-px bg-gray-200 dark:bg-gray-600 my-4" />
					<div className="flex flex-col gap-3">
						<button
							type="button"
							className={getButtonClasses(AppRoutes.EMPLOYEES, 'from-orange-500', 'to-orange-600')}
							onClick={handleGoTo(AppRoutes.EMPLOYEES)}
							aria-label="Employees"
						>
							<i
								className={`i-clarity-employee-group-solid ${getIconClasses(AppRoutes.EMPLOYEES)}`}
							/>
						</button>

						{showBillingCard && (
							<button
								type="button"
								className={getButtonClasses(
									AppRoutes.BILLING_CARD,
									'from-indigo-500',
									'to-indigo-600'
								)}
								onClick={handleGoTo(AppRoutes.BILLING_CARD)}
								aria-label="Billing Card"
							>
								<i className={`i-typcn-business-card ${getIconClasses(AppRoutes.BILLING_CARD)}`} />
							</button>
						)}
					</div>
				</>
			)}

			{/* Bottom Section */}
			<div className="mt-auto flex flex-col gap-3">
				<button
					type="button"
					className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-800"
					onClick={toggleTheme}
					aria-label={`Current theme: ${theme}. Click to change theme`}
					title={`Theme: ${theme}`}
				>
					{theme === 'system' ? (
						<i className="i-material-symbols-computer w-6! h-6! bg-gray-600! dark:bg-gray-300!" />
					) : resolvedTheme === 'dark' ? (
						<i className="i-material-symbols-dark-mode w-6! h-6! bg-gray-600! dark:bg-gray-300!" />
					) : (
						<i className="i-material-symbols-light-mode w-6! h-6! bg-gray-600! dark:bg-gray-300!" />
					)}
				</button>
			</div>
		</div>
	)
})
