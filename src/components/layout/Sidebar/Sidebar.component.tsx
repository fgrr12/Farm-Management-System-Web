import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { useTheme } from '@/hooks/system/useTheme'

export const Sidebar = memo(() => {
	const { user } = useUserStore()
	const { taxDetails } = useFarmStore()
	const navigate = useNavigate()
	const location = useLocation()
	const { theme, resolvedTheme, toggleTheme } = useTheme()
	const { t } = useTranslation('common')

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
			return `w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
				isActive
					? `bg-linear-to-br ${colorFrom} ${colorTo} shadow-lg`
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

	const getLabelClasses = useCallback(
		(path: string) => {
			const isActive = location.pathname.includes(path)
			return `text-[10px] font-medium leading-tight text-center w-full px-1 line-clamp-2 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`
		},
		[location.pathname]
	)

	const showAdminRoutes = useMemo(
		() => user?.role === 'admin' || user?.role === 'owner',
		[user?.role]
	)

	const showTaxDetails = useMemo(
		() => showAdminRoutes && taxDetails !== null && taxDetails.status,
		[showAdminRoutes, taxDetails]
	)

	return (
		<div
			className="bg-white dark:bg-gray-900 h-full hidden lg:flex flex-col items-center py-4 shadow-lg border-r border-gray-100 dark:border-gray-700 w-24"
			role="navigation"
			aria-label="Main navigation"
		>
			{/* Main Navigation */}
			<div className="flex flex-col gap-2 items-center">
				<button
					type="button"
					className={getButtonClasses(AppRoutes.DASHBOARD, 'from-cyan-500', 'to-cyan-600')}
					onClick={handleGoTo(AppRoutes.DASHBOARD)}
					aria-label={t('sidebar.dashboard')}
				>
					<i className={`i-material-symbols-dashboard ${getIconClasses(AppRoutes.DASHBOARD)}`} />
					<span className={getLabelClasses(AppRoutes.DASHBOARD)}>{t('sidebar.dashboard')}</span>
				</button>

				<button
					type="button"
					className={getButtonClasses(AppRoutes.ANIMALS, 'from-blue-500', 'to-blue-600')}
					onClick={handleGoTo(AppRoutes.ANIMALS)}
					aria-label={t('sidebar.animals')}
				>
					<i className={`i-healthicons-animal-cow ${getIconClasses(AppRoutes.ANIMALS)}`} />
					<span className={getLabelClasses(AppRoutes.ANIMALS)}>{t('sidebar.animals')}</span>
				</button>

				<button
					type="button"
					className={getButtonClasses(AppRoutes.TASKS, 'from-green-500', 'to-green-600')}
					onClick={handleGoTo(AppRoutes.TASKS)}
					aria-label={t('sidebar.tasks')}
				>
					<i className={`i-fluent-tasks-app-24-filled ${getIconClasses(AppRoutes.TASKS)}`} />
					<span className={getLabelClasses(AppRoutes.TASKS)}>{t('sidebar.tasks')}</span>
				</button>

				<button
					type="button"
					className={getButtonClasses(AppRoutes.CALENDAR, 'from-purple-500', 'to-purple-600')}
					onClick={handleGoTo(AppRoutes.CALENDAR)}
					aria-label={t('sidebar.calendar')}
				>
					<i
						className={`i-material-symbols-calendar-month ${getIconClasses(AppRoutes.CALENDAR)}`}
					/>
					<span className={getLabelClasses(AppRoutes.CALENDAR)}>{t('sidebar.calendar')}</span>
				</button>

				<button
					type="button"
					className={getButtonClasses(AppRoutes.MY_SPECIES, 'from-indigo-500', 'to-indigo-600')}
					onClick={handleGoTo(AppRoutes.MY_SPECIES)}
					aria-label={t('sidebar.mySpecies')}
				>
					<i className={`i-solar-dna-bold-duotone ${getIconClasses(AppRoutes.MY_SPECIES)}`} />
					<span className={getLabelClasses(AppRoutes.MY_SPECIES)}>{t('sidebar.mySpecies')}</span>
				</button>

				<button
					type="button"
					className={getButtonClasses(AppRoutes.VOICE, 'from-pink-500', 'to-pink-600')}
					onClick={handleGoTo(AppRoutes.VOICE)}
					aria-label={t('sidebar.voice')}
				>
					<i className={`i-heroicons-microphone ${getIconClasses(AppRoutes.VOICE)}`} />
					<span className={getLabelClasses(AppRoutes.VOICE)}>{t('sidebar.voice')}</span>
				</button>
			</div>

			{/* Admin Section */}
			{showAdminRoutes && (
				<>
					<div className="w-10 h-px bg-gray-200 dark:bg-gray-600 my-3" />
					<div className="flex flex-col gap-2 items-center">
						<button
							type="button"
							className={getButtonClasses(AppRoutes.EMPLOYEES, 'from-orange-500', 'to-orange-600')}
							onClick={handleGoTo(AppRoutes.EMPLOYEES)}
							aria-label={t('sidebar.employees')}
						>
							<i
								className={`i-clarity-employee-group-solid ${getIconClasses(AppRoutes.EMPLOYEES)}`}
							/>
							<span className={getLabelClasses(AppRoutes.EMPLOYEES)}>{t('sidebar.employees')}</span>
						</button>

						{showTaxDetails && (
							<button
								type="button"
								className={getButtonClasses(
									AppRoutes.TAX_DETAILS,
									'from-indigo-500',
									'to-indigo-600'
								)}
								onClick={handleGoTo(AppRoutes.TAX_DETAILS)}
								aria-label={t('sidebar.businessCard')}
							>
								<i className={`i-typcn-business-card ${getIconClasses(AppRoutes.TAX_DETAILS)}`} />
								<span className={getLabelClasses(AppRoutes.TAX_DETAILS)}>
									{t('sidebar.businessCard')}
								</span>
							</button>
						)}
					</div>
				</>
			)}

			{/* Bottom Section */}
			<div className="mt-auto flex flex-col gap-2 items-center">
				<button
					type="button"
					className="w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-800"
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
					<span className="text-[10px] font-medium leading-tight text-center w-full px-1 line-clamp-2 text-gray-500 dark:text-gray-400">
						{t('sidebar.theme')}
					</span>
				</button>
			</div>
		</div>
	)
})
