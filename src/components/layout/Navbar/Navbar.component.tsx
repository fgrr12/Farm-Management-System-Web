import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { memo, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { UserService } from '@/services/user'

import { FarmSelector } from '@/components/business/Admin/FarmSelector'
import { NotificationDropdown } from '@/components/business/Notifications/NotificationDropdown'
import { BackButton } from '@/components/ui/Button'

import { useTheme } from '@/hooks/system/useTheme'
import { useBackRoute } from '@/hooks/ui/useBackRoute'

export const Navbar = memo(() => {
	const drawerRef = useRef<HTMLInputElement>(null)
	const titleRef = useRef<HTMLHeadingElement>(null)
	const drawerTitleRef = useRef<HTMLHeadingElement>(null)
	const { user, setUser } = useUserStore()
	const { farm, taxDetails, setFarm } = useFarmStore()
	const { t } = useTranslation('common')
	const navigate = useNavigate()
	const location = useLocation()
	const { headerTitle, loading } = useAppStore()
	const backRoute = useBackRoute()
	const { theme, toggleTheme } = useTheme()

	const getCurrentPageIcon = useMemo(() => {
		if (location.pathname.includes(AppRoutes.ANIMALS)) {
			return 'i-healthicons-animal-cow'
		}
		if (location.pathname.includes(AppRoutes.TASKS)) {
			return 'i-fluent-tasks-app-24-filled'
		}
		if (location.pathname.includes(AppRoutes.MY_SPECIES)) {
			return 'i-solar-dna-bold-duotone'
		}
		if (location.pathname.includes(AppRoutes.EMPLOYEES)) {
			return 'i-clarity-employee-group-solid'
		}
		if (location.pathname.includes(AppRoutes.TAX_DETAILS)) {
			return 'i-typcn-business-card'
		}
		if (location.pathname.includes(AppRoutes.MY_ACCOUNT)) {
			return 'i-material-symbols-account-circle'
		}
		if (location.pathname.includes(AppRoutes.DASHBOARD)) {
			return 'i-material-symbols-dashboard'
		}
		if (location.pathname.includes(AppRoutes.CALENDAR)) {
			return 'i-material-symbols-calendar-month'
		}
		if (location.pathname.includes(AppRoutes.VOICE)) {
			return 'i-heroicons-microphone'
		}
		// Default icon
		return 'i-healthicons-animal-cow'
	}, [location.pathname])

	const getCurrentPageColor = useMemo(() => {
		if (location.pathname.includes(AppRoutes.ANIMALS)) {
			return 'from-blue-500 to-blue-600'
		}
		if (location.pathname.includes(AppRoutes.TASKS)) {
			return 'from-green-500 to-green-600'
		}
		if (location.pathname.includes(AppRoutes.MY_SPECIES)) {
			return 'from-indigo-500 to-indigo-600'
		}
		if (location.pathname.includes(AppRoutes.EMPLOYEES)) {
			return 'from-orange-500 to-orange-600'
		}
		if (location.pathname.includes(AppRoutes.TAX_DETAILS)) {
			return 'from-indigo-500 to-indigo-600'
		}
		if (location.pathname.includes(AppRoutes.MY_ACCOUNT)) {
			return 'from-gray-500 to-gray-600'
		}
		if (location.pathname.includes(AppRoutes.DASHBOARD)) {
			return 'from-cyan-500 to-cyan-600'
		}
		if (location.pathname.includes(AppRoutes.CALENDAR)) {
			return 'from-purple-500 to-purple-600'
		}
		if (location.pathname.includes(AppRoutes.VOICE)) {
			return 'from-pink-500 to-pink-600'
		}
		// Default color
		return 'from-blue-500 to-purple-600'
	}, [location.pathname])

	const backButtonHidden = useMemo(
		() =>
			location.pathname === AppRoutes.ANIMALS ||
			location.pathname === AppRoutes.EMPLOYEES ||
			location.pathname === AppRoutes.TASKS ||
			location.pathname === AppRoutes.MY_ACCOUNT ||
			location.pathname === AppRoutes.MY_SPECIES ||
			location.pathname === AppRoutes.TAX_DETAILS ||
			location.pathname === AppRoutes.DASHBOARD ||
			location.pathname === AppRoutes.CALENDAR ||
			location.pathname === AppRoutes.VOICE,
		[location.pathname]
	)

	const handleBack = useCallback(() => {
		navigate(backRoute as string)
	}, [navigate, backRoute])

	const closeDrawer = useCallback(() => {
		if (drawerRef.current) drawerRef.current.checked = false
	}, [])

	const goTo = useCallback(
		(path: string) => () => {
			navigate(path)
			closeDrawer()
		},
		[navigate, closeDrawer]
	)

	const goToFromDropdown = useCallback(
		(path: string) => () => {
			navigate(path)
			// Close dropdown by removing focus
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur()
			}
		},
		[navigate]
	)

	const handleLogout = useCallback(async () => {
		if (!user) return
		// Close dropdown first
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur()
		}
		await UserService.logout()
		setUser(null)
		setFarm(null)
		navigate(AppRoutes.LOGIN)
	}, [user, setUser, setFarm, navigate])

	useGSAP(() => {
		const el = titleRef.current
		if (!el || loading || !headerTitle.trim()) return

		const split = new SplitText(el, { type: 'chars' })

		gsap.from(split.chars, {
			autoAlpha: 0,
			x: 10,
			duration: 1,
			stagger: 0.05,
			ease: 'power1.out',
		})

		return () => {
			split.revert()
		}
	}, [headerTitle, loading])

	useGSAP(() => {
		const drawer = drawerRef.current
		if (!drawer || !drawerTitleRef.current || !farm) return

		const handleChange = () => {
			if (drawer.checked && drawerTitleRef.current) {
				const split = new SplitText(drawerTitleRef.current, { type: 'chars' })
				gsap.from(split.chars, {
					autoAlpha: 0,
					x: 10,
					duration: 1,
					stagger: 0.05,
					ease: 'power1.out',
				})
				return () => {
					setTimeout(() => split.revert(), 2000)
				}
			}
		}

		drawer.addEventListener('change', handleChange)

		return () => {
			drawer.removeEventListener('change', handleChange)
		}
	}, [farm])
	return (
		<div className="drawer">
			<input id="my-drawer" type="checkbox" className="drawer-toggle" ref={drawerRef} />
			<div className="drawer-content">
				<div className="navbar bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border-b border-gray-100 dark:border-gray-700">
					<div className="navbar-start">
						<div className="flex items-center gap-2">
							<label
								htmlFor="my-drawer"
								className="btn btn-ghost btn-circle hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110 active:scale-95"
								aria-label="Open menu"
							>
								<i className="i-flowbite-bars-from-left-outline w-6! h-6! bg-gray-600! dark:bg-gray-300! transition-transform duration-200 hover:rotate-180" />
							</label>
							{!backButtonHidden && (
								<BackButton disabled={!user} onClick={handleBack}>
									{t('header.return')}
								</BackButton>
							)}
						</div>
					</div>
					<div className="navbar-center">
						<div className="flex items-center gap-3">
							<div
								className={`w-8 h-8 bg-gradient-to-br ${getCurrentPageColor} rounded-lg flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 hover:rotate-12`}
							>
								<i
									className={`${getCurrentPageIcon} w-5! h-5! bg-white! transition-transform duration-200`}
								/>
							</div>
							<h2
								ref={titleRef}
								className="text-xl font-bold text-gray-800 dark:text-gray-200 tracking-tight"
							>
								{headerTitle}
							</h2>
						</div>
					</div>
					<div className="navbar-end">
						<div className="flex items-center gap-2">
							{/* User Avatar */}
							<div className="dropdown dropdown-end relative">
								<button
									type="button"
									tabIndex={0}
									className="btn btn-ghost btn-circle avatar hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-110 touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
									aria-label="User menu"
									aria-haspopup="true"
									aria-expanded="false"
								>
									{user?.photoUrl ? (
										<img
											src={user.photoUrl}
											alt={`${user.name} ${user.lastName}`}
											className="w-8 h-8 rounded-full object-cover transition-all duration-200 hover:shadow-lg"
										/>
									) : (
										<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transition-all duration-200 hover:shadow-lg">
											<span className="text-white text-sm font-semibold leading-none h-full flex items-center justify-center transition-transform duration-200 hover:scale-110">
												{user?.name?.charAt(0)?.toUpperCase() || 'U'}
											</span>
										</div>
									)}
								</button>
								<ul
									className="menu dropdown-content bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-[50] mt-3 w-52 p-2 absolute right-0 top-full"
									aria-label="User menu options"
								>
									<li className="menu-title text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
										<span>
											{user?.name} {user?.lastName}
										</span>
									</li>
									<div className="divider my-1" />
									<li role="none">
										<button
											type="button"
											role="menuitem"
											onClick={goToFromDropdown(AppRoutes.MY_ACCOUNT)}
											className="flex items-center gap-3 px-3 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-gray-700 dark:text-gray-300 w-full text-left touch-manipulation min-h-[44px] focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20"
											tabIndex={-1}
										>
											<i className="i-material-symbols-account-circle w-4! h-4! bg-blue-600! dark:bg-blue-400!" />
											<span className="text-sm">{t('sidebar.myAccount')}</span>
										</button>
									</li>
									<li role="none">
										<button
											type="button"
											role="menuitem"
											onClick={handleLogout}
											className="flex items-center gap-3 px-3 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400 w-full text-left touch-manipulation min-h-[44px] focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
											tabIndex={-1}
										>
											<i className="i-material-symbols-logout w-4! h-4! bg-red-600! dark:bg-red-400!" />
											<span className="text-sm">{t('sidebar.logout')}</span>
										</button>
									</li>
								</ul>
							</div>

							{/* Notifications */}
							<NotificationDropdown />
						</div>
					</div>
				</div>
			</div>
			<div className="drawer-side z-10">
				<label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay" />
				<div
					className="bg-white dark:bg-gray-800 min-h-full w-80 shadow-2xl border-r border-gray-100 dark:border-gray-700"
					role="navigation"
					aria-label="Main navigation"
				>
					{/* Sidebar Header */}
					{farm && (
						<div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
							<div className="flex items-center gap-3 mb-2">
								<div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
									<i className="i-healthicons-animal-cow w-6! h-6! bg-white!" />
								</div>
								<div>
									<h2 ref={drawerTitleRef} className="font-bold">
										{farm!.name}
									</h2>
									<p className="text-blue-100 text-sm opacity-90">{t('sidebar.farmManagement')}</p>
								</div>
							</div>
						</div>
					)}

					{/* Navigation Menu */}
					<div className="p-4">
						{/* Main Navigation */}
						<div className="space-y-2">
							<div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
								{t('sidebar.mainMenu')}
							</div>

							<button
								type="button"
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
									location.pathname.includes(AppRoutes.DASHBOARD)
										? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg'
										: 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
								}`}
								onClick={goTo(AppRoutes.DASHBOARD)}
							>
								<div
									className={`w-8 h-8 rounded-lg flex items-center justify-center ${
										location.pathname.includes(AppRoutes.DASHBOARD) ? 'bg-white/20' : 'bg-cyan-100'
									}`}
								>
									<i
										className={`i-material-symbols-dashboard w-5! h-5! ${
											location.pathname.includes(AppRoutes.DASHBOARD) ? 'bg-white!' : 'bg-cyan-600!'
										}`}
									/>
								</div>
								<span className="font-medium">{t('sidebar.dashboard')}</span>
							</button>

							<button
								type="button"
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
									location.pathname.includes(AppRoutes.ANIMALS)
										? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
										: 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
								}`}
								onClick={goTo(AppRoutes.ANIMALS)}
							>
								<div
									className={`w-8 h-8 rounded-lg flex items-center justify-center ${
										location.pathname.includes(AppRoutes.ANIMALS) ? 'bg-white/20' : 'bg-blue-100'
									}`}
								>
									<i
										className={`i-healthicons-animal-cow w-5! h-5! ${
											location.pathname.includes(AppRoutes.ANIMALS) ? 'bg-white!' : 'bg-blue-600!'
										}`}
									/>
								</div>
								<span className="font-medium">{t('sidebar.animals')}</span>
							</button>

							<button
								type="button"
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
									location.pathname.includes(AppRoutes.TASKS)
										? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
										: 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
								}`}
								onClick={goTo(AppRoutes.TASKS)}
							>
								<div
									className={`w-8 h-8 rounded-lg flex items-center justify-center ${
										location.pathname.includes(AppRoutes.TASKS) ? 'bg-white/20' : 'bg-green-100'
									}`}
								>
									<i
										className={`i-fluent-tasks-app-24-filled w-5! h-5! ${
											location.pathname.includes(AppRoutes.TASKS) ? 'bg-white!' : 'bg-green-600!'
										}`}
									/>
								</div>
								<span className="font-medium">{t('sidebar.tasks')}</span>
							</button>

							<button
								type="button"
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
									location.pathname.includes(AppRoutes.CALENDAR)
										? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
										: 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
								}`}
								onClick={goTo(AppRoutes.CALENDAR)}
							>
								<div
									className={`w-8 h-8 rounded-lg flex items-center justify-center ${
										location.pathname.includes(AppRoutes.CALENDAR) ? 'bg-white/20' : 'bg-purple-100'
									}`}
								>
									<i
										className={`i-material-symbols-calendar-month w-5! h-5! ${
											location.pathname.includes(AppRoutes.CALENDAR)
												? 'bg-white!'
												: 'bg-purple-600!'
										}`}
									/>
								</div>
								<span className="font-medium">{t('sidebar.calendar')}</span>
							</button>

							<button
								type="button"
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
									location.pathname.includes(AppRoutes.MY_SPECIES)
										? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
										: 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
								}`}
								onClick={goTo(AppRoutes.MY_SPECIES)}
							>
								<div
									className={`w-8 h-8 rounded-lg flex items-center justify-center ${
										location.pathname.includes(AppRoutes.MY_SPECIES)
											? 'bg-white/20'
											: 'bg-indigo-100'
									}`}
								>
									<i
										className={`i-solar-dna-bold-duotone w-5! h-5! ${
											location.pathname.includes(AppRoutes.MY_SPECIES)
												? 'bg-white!'
												: 'bg-indigo-600!'
										}`}
									/>
								</div>
								<span className="font-medium">{t('sidebar.mySpecies')}</span>
							</button>

							<button
								type="button"
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
									location.pathname.includes(AppRoutes.VOICE)
										? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
										: 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
								}`}
								onClick={goTo(AppRoutes.VOICE)}
							>
								<div
									className={`w-8 h-8 rounded-lg flex items-center justify-center ${
										location.pathname.includes(AppRoutes.VOICE) ? 'bg-white/20' : 'bg-pink-100'
									}`}
								>
									<i
										className={`i-heroicons-microphone w-5! h-5! ${
											location.pathname.includes(AppRoutes.VOICE) ? 'bg-white!' : 'bg-pink-600!'
										}`}
									/>
								</div>
								<span className="font-medium">{t('sidebar.voice')}</span>
							</button>
						</div>

						{/* Admin Section */}
						{(user?.role === 'admin' || user?.role === 'owner') && (
							<div className="mt-6 space-y-2">
								<div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
									{t('sidebar.administration')}
								</div>

								<button
									type="button"
									className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
										location.pathname.includes(AppRoutes.EMPLOYEES)
											? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
											: 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
									}`}
									onClick={goTo(AppRoutes.EMPLOYEES)}
								>
									<div
										className={`w-8 h-8 rounded-lg flex items-center justify-center ${
											location.pathname.includes(AppRoutes.EMPLOYEES)
												? 'bg-white/20'
												: 'bg-orange-100'
										}`}
									>
										<i
											className={`i-clarity-employee-group-solid w-5! h-5! ${
												location.pathname.includes(AppRoutes.EMPLOYEES)
													? 'bg-white!'
													: 'bg-orange-600!'
											}`}
										/>
									</div>
									<span className="font-medium">{t('sidebar.employees')}</span>
								</button>

								{taxDetails && taxDetails.status && (
									<button
										type="button"
										className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
											location.pathname.includes(AppRoutes.TAX_DETAILS)
												? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
												: 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
										}`}
										onClick={goTo(AppRoutes.TAX_DETAILS)}
									>
										<div
											className={`w-8 h-8 rounded-lg flex items-center justify-center ${
												location.pathname.includes(AppRoutes.TAX_DETAILS)
													? 'bg-white/20'
													: 'bg-indigo-100'
											}`}
										>
											<i
												className={`i-typcn-business-card w-5! h-5! ${
													location.pathname.includes(AppRoutes.TAX_DETAILS)
														? 'bg-white!'
														: 'bg-indigo-600!'
												}`}
											/>
										</div>
										<span className="font-medium">{t('sidebar.businessCard')}</span>
									</button>
								)}
							</div>
						)}

						{/* Farm Selector for Admin */}
						<FarmSelector />

						{/* Settings Section */}
						<div className="mt-6 space-y-2">
							<div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
								{t('sidebar.settings')}
							</div>

							<button
								type="button"
								className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors w-full"
								onClick={toggleTheme}
							>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
										{theme === 'system' ? (
											<i className="i-material-symbols-computer w-5! h-5! bg-gray-600! dark:bg-gray-300!" />
										) : theme === 'dark' ? (
											<i className="i-material-symbols-dark-mode w-5! h-5! bg-gray-600! dark:bg-gray-300!" />
										) : (
											<i className="i-material-symbols-light-mode w-5! h-5! bg-gray-600! dark:bg-gray-300!" />
										)}
									</div>
									<span className="font-medium text-gray-700 dark:text-gray-300">
										{t('sidebar.theme')}
									</span>
								</div>
								<span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
									{theme === 'system'
										? t('theme.system')
										: theme === 'dark'
											? t('theme.dark')
											: t('theme.light')}
								</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
})
