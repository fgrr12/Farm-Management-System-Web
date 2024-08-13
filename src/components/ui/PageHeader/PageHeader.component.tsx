import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ActionButton } from '../ActionButton'
import { BackButton } from '../Button'

import { AppRoutes } from '@/config/constants/routes'
import { useAppStore } from '@/store/useAppStore'

import * as S from './PageHeader.styles'

export const PageHeader: FC = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { headerTitle, collapseSidebar, setCollapseSidebar } = useAppStore()

	const backButtonHidden =
		location.pathname === AppRoutes.ANIMALS ||
		location.pathname === AppRoutes.EMPLOYEES ||
		location.pathname === AppRoutes.MY_ACCOUNT

	const handleBack = () => {
		navigate(-1)
	}

	return (
		<S.PageHeader $backButtonHidden={backButtonHidden}>
			<S.Sidebar
				$collapse={collapseSidebar}
				$backButtonHidden={backButtonHidden}
				onClick={() => setCollapseSidebar(!collapseSidebar)}
			>
				{!collapseSidebar && <S.SidebarTitle>My Farm</S.SidebarTitle>}
				<S.SidebarCloseButton>
					<ActionButton
						icon={
							collapseSidebar
								? 'i-material-symbols-right-panel-close'
								: 'i-material-symbols-left-panel-close-rounded'
						}
					/>
				</S.SidebarCloseButton>
			</S.Sidebar>
			{!backButtonHidden && <BackButton onClick={handleBack}>{t('header.return')}</BackButton>}
			<S.Title>{headerTitle}</S.Title>
		</S.PageHeader>
	)
}
