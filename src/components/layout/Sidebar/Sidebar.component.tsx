import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { UserService } from '@/services/user'

export const Sidebar = () => {
	const { user, setUser } = useUserStore()
	const { billingCard, setFarm } = useFarmStore()
	const { loading } = useAppStore()
	const navigate = useNavigate()
	const location = useLocation()

	const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'light')

	const handleLogout = async () => {
		if (!user) return
		await UserService.logout()
		setUser(null)
		setFarm(null)
		navigate(AppRoutes.LOGIN)
	}

	const handleGoTo = (path: string) => () => {
		if (location.pathname === path) return
		navigate(path)
	}

	const handleCheckActive = (path: string) => {
		if (location.pathname === path) return 'bg-info rounded-sm'
		return ''
	}

	useEffect(() => {
		localStorage.setItem('theme', theme)
		document.querySelector('html')!.setAttribute('data-theme', theme)
	}, [theme])

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
		<ul className="menu bg-base-100 h-full hidden lg:grid auto-rows-[50px] items-center shadow-sm overflow-auto scrollbar-hidden" role="navigation" aria-label="Main navigation">
			<li className={handleCheckActive(AppRoutes.ANIMALS)}>
				<button
					type="button"
					className="flex items-center gap-2 px-4 py-2"
					onClick={handleGoTo(AppRoutes.ANIMALS)}
					aria-label="Animals"
				>
					<i className="i-healthicons-animal-cow w-8! h-8!" />
				</button>
			</li>
			<li className={handleCheckActive(AppRoutes.TASKS)}>
				<button
					type="button"
					className="flex items-center gap-2 px-4 py-2"
					onClick={handleGoTo(AppRoutes.TASKS)}
					aria-label="Tasks"
				>
					<i className="i-fluent-tasks-app-24-filled w-8! h-8!" />
				</button>
			</li>
			<li className={handleCheckActive(AppRoutes.MY_SPECIES)}>
				<button
					type="button"
					className="flex items-center gap-2 px-4 py-2"
					onClick={handleGoTo(AppRoutes.MY_SPECIES)}
					aria-label="My Species"
				>
					<i className="i-solar-dna-bold-duotone w-8! h-8!" />
				</button>
			</li>

			{(user?.role === 'admin' || user?.role === 'owner') && <div className="divider" />}
			{(user?.role === 'admin' || user?.role === 'owner') && (
				<li className={handleCheckActive(AppRoutes.EMPLOYEES)}>
					<button
						type="button"
						className="flex items-center gap-2 px-4 py-2"
						onClick={handleGoTo(AppRoutes.EMPLOYEES)}
						aria-label="Employees"
					>
						<i className="i-clarity-employee-group-solid w-8! h-8!" />
					</button>
				</li>
			)}
			{(user?.role === 'admin' || user?.role === 'owner') &&
				billingCard !== null &&
				billingCard.status && (
					<li className={handleCheckActive(AppRoutes.BILLING_CARD)}>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2"
							onClick={handleGoTo(AppRoutes.BILLING_CARD)}
							aria-label="Billing Card"
						>
							<i className="i-typcn-business-card w-8! h-8!" />
						</button>
					</li>
				)}
			<div className="divider" />
			<li className={handleCheckActive(AppRoutes.MY_ACCOUNT)}>
				<button
					type="button"
					className="flex items-center gap-2 px-4 py-2"
					onClick={handleGoTo(AppRoutes.MY_ACCOUNT)}
					aria-label="My Account"
				>
					<i className="i-material-symbols-account-circle w-8! h-8!" />
				</button>
			</li>
			<li>
				<button type="button" className="flex items-center gap-2 px-4 py-2" onClick={handleLogout} aria-label="Logout">
					<i className="i-material-symbols-logout w-8! h-8!" />
				</button>
			</li>
			<div className="divider" />
			<li>
				<label className="swap swap-rotate" aria-label="Toggle theme">
					<input
						type="checkbox"
						className="theme-controller"
						value="synthwave"
						onChange={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
					/>
					<i className="i-line-md-moon-alt-to-sunny-outline-loop-transition swap-off h-8! w-8! fill-current" />
					<i className="i-line-md-sunny-outline-to-moon-alt-loop-transition swap-on h-8! w-8! fill-current" />
				</label>
			</li>
		</ul>
	)
}
