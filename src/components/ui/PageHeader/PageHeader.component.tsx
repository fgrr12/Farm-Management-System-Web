import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { ActionButton } from '../ActionButton'
import { BackButton } from '../Button'

import { AppRoutes } from '@/config/constants/routes'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'

import * as S from './PageHeader.styles'

export const PageHeader: FC = () => {
	const { farm } = useFarmStore()
	const { t } = useTranslation()
	const navigate = useNavigate()
	const location = useLocation()
	const { headerTitle, collapseSidebar, setCollapseSidebar, setTopHeaderHeight } = useAppStore()

	const backButtonHidden =
		location.pathname === AppRoutes.ANIMALS ||
		location.pathname === AppRoutes.EMPLOYEES ||
		location.pathname === AppRoutes.MY_ACCOUNT ||
		location.pathname === AppRoutes.TASKS

	const handleBack = () => {
		navigate(-1)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect every time location changes
	useEffect(() => {
		const element = document.getElementById('pageHeader')
		const height = element?.clientHeight
		setTopHeaderHeight(height || 0)
	}, [location])

	return (
		<S.PageHeader id="pageHeader" $backButtonHidden={backButtonHidden}>
			<S.Sidebar
				$collapse={collapseSidebar}
				$backButtonHidden={backButtonHidden}
				onClick={() => setCollapseSidebar(!collapseSidebar)}
			>
				{!collapseSidebar && <S.SidebarTitle>{farm!.name}</S.SidebarTitle>}
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
