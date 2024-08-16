import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'
import { UserService } from '@/services/user'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import * as S from './Sidebar.styles'

export const Sidebar: FC = () => {
	const { user } = useUserStore()
	const navigate = useNavigate()
	const { collapseSidebar, setCollapseSidebar } = useAppStore()
	const { t } = useTranslation('common')

	const handleCheckPath = (path: string) => {
		return location.pathname.includes(path)
	}

	const handleGoTo = (path: string) => {
		if (!user) return
		if (window.innerWidth <= 768) {
			setCollapseSidebar(true)
		}
		navigate(path)
	}

	const handleLogout = async () => {
		if (!user) return
		await UserService.logout()
		navigate(AppRoutes.LOGIN)
	}

	return (
		<S.Sidebar $collapse={collapseSidebar}>
			<S.SidebarContent>
				<S.SidebarMenu>
					<S.SidebarMenuItem
						$collapse={collapseSidebar}
						$selected={handleCheckPath(AppRoutes.ANIMALS)}
						$disabled={!user}
						onClick={() => handleGoTo(AppRoutes.ANIMALS)}
					>
						<S.Icon className="i-healthicons-animal-cow" $collapse={collapseSidebar} />
						{!collapseSidebar && t('sidebar.animals')}
					</S.SidebarMenuItem>
					<S.SidebarMenuItem
						$collapse={collapseSidebar}
						$selected={handleCheckPath(AppRoutes.TASKS)}
						$disabled={!user}
						onClick={() => handleGoTo(AppRoutes.TASKS)}
					>
						<S.Icon className="i-fluent-tasks-app-24-filled" $collapse={collapseSidebar} />
						{!collapseSidebar && t('sidebar.tasks')}
					</S.SidebarMenuItem>
					{(user?.role === 'admin' || user?.role === 'owner') && (
						<S.SidebarMenuItem
							$collapse={collapseSidebar}
							$selected={handleCheckPath(AppRoutes.EMPLOYEES)}
							$disabled={!user}
							onClick={() => handleGoTo(AppRoutes.EMPLOYEES)}
						>
							<S.Icon className="i-clarity-employee-group-solid" $collapse={collapseSidebar} />
							{!collapseSidebar && t('sidebar.employees')}
						</S.SidebarMenuItem>
					)}
					<S.Divider />
					<S.SidebarMenuItem
						$collapse={collapseSidebar}
						$selected={handleCheckPath(AppRoutes.MY_ACCOUNT)}
						$disabled={!user}
						onClick={() => handleGoTo(AppRoutes.MY_ACCOUNT)}
					>
						<S.Icon className="i-material-symbols-account-circle" $collapse={collapseSidebar} />
						{!collapseSidebar && t('sidebar.myAccount')}
					</S.SidebarMenuItem>
					<S.SidebarMenuItem $collapse={collapseSidebar} $disabled={!user} onClick={handleLogout}>
						<S.Icon className="i-material-symbols-logout" $collapse={collapseSidebar} />
						{!collapseSidebar && t('sidebar.logout')}
					</S.SidebarMenuItem>
				</S.SidebarMenu>
			</S.SidebarContent>
		</S.Sidebar>
	)
}
