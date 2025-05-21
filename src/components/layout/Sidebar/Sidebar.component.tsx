import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppRoutes } from '@/config/constants/routes'
import { UserService } from '@/services/user'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

export const Sidebar: FC = () => {
	const { user, setUser } = useUserStore()
	const { setFarm } = useFarmStore()
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

	useEffect(() => {
		localStorage.setItem('theme', theme)
		document.querySelector('html')!.setAttribute('data-theme', theme)
	}, [theme])
	return (
		<ul className="menu bg-base-100 h-full hidden lg:grid auto-rows-[50px] items-center shadow-sm overflow-auto scrollbar-hidden">
			<li className={location.pathname.includes(AppRoutes.ANIMALS) ? 'bg-info rounded-sm' : ''}>
				<button
					type="button"
					className="flex items-center gap-2 px-4 py-2"
					onClick={() => navigate(AppRoutes.ANIMALS)}
				>
					<i className="i-healthicons-animal-cow w-8! h-8!" />
				</button>
			</li>
			<li className={location.pathname.includes(AppRoutes.TASKS) ? 'bg-info rounded-sm' : ''}>
				<button
					type="button"
					className="flex items-center gap-2 px-4 py-2"
					onClick={() => navigate(AppRoutes.TASKS)}
				>
					<i className="i-fluent-tasks-app-24-filled w-8! h-8!" />
				</button>
			</li>
			<li className={location.pathname.includes(AppRoutes.MY_SPECIES) ? 'bg-info rounded-sm' : ''}>
				<button
					type="button"
					className="flex items-center gap-2 px-4 py-2"
					onClick={() => navigate(AppRoutes.MY_SPECIES)}
				>
					<i className="i-solar-dna-bold-duotone w-8! h-8!" />
				</button>
			</li>

			{/* {(user?.role === 'admin' || user?.role === 'owner') && <div className="divider" />} */}
			{(user?.role === 'admin' || user?.role === 'owner') && (
				<li className={location.pathname.includes(AppRoutes.EMPLOYEES) ? 'bg-info rounded-sm' : ''}>
					<button
						type="button"
						className="flex items-center gap-2 px-4 py-2"
						onClick={() => navigate(AppRoutes.EMPLOYEES)}
					>
						<i className="i-clarity-employee-group-solid w-8! h-8!" />
					</button>
				</li>
			)}
			{(user?.role === 'admin' || user?.role === 'owner') && (
				<li
					className={location.pathname.includes(AppRoutes.BILLING_CARD) ? 'bg-info rounded-sm' : ''}
				>
					<button
						type="button"
						className="flex items-center gap-2 px-4 py-2"
						onClick={() => navigate(AppRoutes.BILLING_CARD)}
					>
						<i className="i-typcn-business-card w-8! h-8!" />
					</button>
				</li>
			)}
			<div className="divider" />
			<li className={location.pathname.includes(AppRoutes.MY_ACCOUNT) ? 'bg-info rounded-sm' : ''}>
				<button
					type="button"
					className="flex items-center gap-2 px-4 py-2"
					onClick={() => navigate(AppRoutes.MY_ACCOUNT)}
				>
					<i className="i-material-symbols-account-circle w-8! h-8!" />
				</button>
			</li>
			<li>
				<button type="button" className="flex items-center gap-2 px-4 py-2" onClick={handleLogout}>
					<i className="i-material-symbols-logout w-8! h-8!" />
				</button>
			</li>
			<div className="divider" />
			<li>
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
			</li>
		</ul>
	)
}
