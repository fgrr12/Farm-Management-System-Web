import { ActionButton } from '../ActionButton'

import * as S from './Sidebar.styles'

export const Sidebar: FC = () => {
	return (
		<S.Sidebar>
			<S.SidebarHeader>
				<S.SidebarTitle>unoCSS</S.SidebarTitle>
				<S.SidebarCloseButton>
					<ActionButton icon="close" />
				</S.SidebarCloseButton>
			</S.SidebarHeader>
			<S.SidebarContent>
				<S.SidebarMenu>
					<S.SidebarMenuItem>
						<S.Icon className="home" />
						Home
					</S.SidebarMenuItem>
					<S.SidebarMenuItem>
						<S.Icon className="settings" />
						Settings
					</S.SidebarMenuItem>
					<S.SidebarMenuItem>
						<S.Icon className="logout" />
						Logout
					</S.SidebarMenuItem>
				</S.SidebarMenu>
			</S.SidebarContent>
		</S.Sidebar>
	)
}
