import { AppRoutes } from '@/config/constants/routes'
import { useLocation, useNavigate } from 'react-router-dom'

import { UserService } from '@/services/user'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

export const Sidebar: FC = () => {
	const { user, setUser } = useUserStore()
	const { setFarm } = useFarmStore()
	const navigate = useNavigate()
	const location = useLocation()

	console.log(location.pathname)

	const handleLogout = async () => {
		if (!user) return
		await UserService.logout()
		setUser(null)
		setFarm(null)
		navigate(AppRoutes.LOGIN)
	}

	return (
		<ul className="menu bg-base-100 h-full hidden lg:flex">
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
			<div className="divider" />
			<li>
				<button type="button" className="flex items-center gap-2 px-4 py-2" onClick={handleLogout}>
					<i className="i-material-symbols-logout w-8! h-8!" />
				</button>
			</li>
		</ul>
	)
}
