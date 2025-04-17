import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'
import { UserService } from '@/services/user'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

export const Sidebar: FC = () => {
	const { user, setUser } = useUserStore()
	const { setFarm } = useFarmStore()
	const navigate = useNavigate()

	const handleLogout = async () => {
		if (!user) return
		await UserService.logout()
		setUser(null)
		setFarm(null)
		navigate(AppRoutes.LOGIN)
	}

	return (
		<ul className="menu bg-base-100 h-full">
			<li>
				<button
					type="button"
					className="flex items-center gap-2 px-4 py-2 selection:bg-red"
					onClick={() => navigate(AppRoutes.ANIMALS)}
				>
					<i className="i-healthicons-animal-cow w-8! h-8!" />
				</button>
			</li>
			<li>
				<button
					type="button"
					className="flex items-center gap-2 px-4 py-2 selection:bg-red"
					onClick={() => navigate(AppRoutes.TASKS)}
				>
					<i className="i-fluent-tasks-app-24-filled w-8! h-8!" />
				</button>
			</li>
			<li>
				<button
					type="button"
					className="flex items-center gap-2 px-4 py-2 selection:bg-red"
					onClick={() => navigate(AppRoutes.MY_SPECIES)}
				>
					<i className="i-solar-dna-bold-duotone w-8! h-8!" />
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
				</button>
			</li>
		</ul>
	)
}
