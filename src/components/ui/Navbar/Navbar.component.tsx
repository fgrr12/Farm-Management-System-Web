import { AppRoutes } from '@/config/constants/routes'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { BackButton } from '../Button'

import { UserService } from '@/services/user'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

export const Navbar: FC = () => {
	const { user, setUser } = useUserStore()
	const { farm, setFarm } = useFarmStore()
	const { t } = useTranslation('common')
	const navigate = useNavigate()
	const location = useLocation()
	const { headerTitle } = useAppStore()

	const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'light')

	const backButtonHidden =
		location.pathname === AppRoutes.ANIMALS ||
		location.pathname === AppRoutes.EMPLOYEES ||
		location.pathname === AppRoutes.TASKS ||
		location.pathname === AppRoutes.MY_ACCOUNT ||
		location.pathname === AppRoutes.MY_SPECIES

	const handleBack = () => {
		const path = location.pathname.split('/')
		path.pop()
		navigate(path.join('/'))
	}

	const handleLogout = async () => {
		if (!user) return
		await UserService.logout()
		setUser(null)
		setFarm(null)
		navigate(AppRoutes.LOGIN)
	}

	useEffect(() => {
		localStorage.setItem('theme', theme)
		document.querySelector('html')!.setAttribute('data-theme', theme)
	}, [theme])
	return (
		<div className="drawer">
			<input id="my-drawer" type="checkbox" className="drawer-toggle" />
			<div className="drawer-content">
				<div className="navbar bg-base-100 shadow-sm">
					<div className="navbar-start">
						<div className="dropdown">
							<label htmlFor="my-drawer" className="btn btn-ghost btn-circle">
								<i className="i-flowbite-bars-from-left-outline w-8! h-8!" />
							</label>
							{!backButtonHidden && (
								<BackButton disabled={!user} onClick={handleBack}>
									{t('header.return')}
								</BackButton>
							)}
						</div>
					</div>
					<div className="navbar-center">
						<h2 className="text-2xl font-bold">{headerTitle}</h2>
					</div>
					<div className="navbar-end">
						<button type="button" className="btn btn-ghost btn-circle">
							<div className="indicator">
								<i className="i-material-symbols-notifications-outline-sharp w-6! h-6!" />
								<span className="badge badge-xs badge-primary indicator-item" />
							</div>
						</button>
					</div>
				</div>
			</div>
			<div className="drawer-side z-10">
				<label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay" />
				<ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
					{farm && <h2 className="text-xl font-bold mb-2 text-center">{farm!.name}</h2>}
					<li>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2 selection:bg-red"
							onClick={() => navigate(AppRoutes.ANIMALS)}
						>
							<i className="i-healthicons-animal-cow w-8! h-8!" />
							<span className="text-sm">{t('sidebar.animals')}</span>
						</button>
					</li>
					<li>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2 selection:bg-red"
							onClick={() => navigate(AppRoutes.TASKS)}
						>
							<i className="i-fluent-tasks-app-24-filled w-8! h-8!" />
							<span className="text-sm">{t('sidebar.tasks')}</span>
						</button>
					</li>
					<li>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2 selection:bg-red"
							onClick={() => navigate(AppRoutes.MY_SPECIES)}
						>
							<i className="i-solar-dna-bold-duotone w-8! h-8!" />
							<span className="text-sm">{t('sidebar.mySpecies')}</span>
						</button>
					</li>
					<div className="divider" />
					<li>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2 selection:bg-red"
							onClick={() => navigate(AppRoutes.MY_ACCOUNT)}
						>
							<i className="i-material-symbols-account-circle w-8! h-8!" />
							<span className="text-sm">{t('sidebar.myAccount')}</span>
						</button>
					</li>
					{(user?.role === 'admin' || user?.role === 'owner') && (
						<li>
							<button
								type="button"
								className="flex items-center gap-2 px-4 py-2 selection:bg-red"
								onClick={() => navigate(AppRoutes.EMPLOYEES)}
							>
								<i className="i-clarity-employee-group-solid w-8! h-8!" />
								<span className="text-sm">{t('sidebar.employees')}</span>
							</button>
						</li>
					)}
					<div className="divider" />
					<li>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2 selection:bg-red"
							onClick={handleLogout}
						>
							<i className="i-material-symbols-logout w-8! h-8!" />
							<span className="text-sm">{t('sidebar.logout')}</span>
						</button>
					</li>
					<div className="divider" />
					<li className="flex items-center content-start flex-row">
						<label className="swap swap-rotate">
							<input
								type="checkbox"
								className="theme-controller"
								value="synthwave"
								onChange={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
							/>
							<i className="i-line-md-moon-alt-to-sunny-outline-loop-transition swap-off h-8! w-8! fill-current" />
							<i className="i-line-md-sunny-outline-to-moon-alt-loop-transition swap-on h-8! w-8! fill-current" />
						</label>
						<span className="text-sm p-0">{t('sidebar.theme')}</span>
					</li>
				</ul>
			</div>
		</div>
	)
}
