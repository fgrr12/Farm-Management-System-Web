import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { ActionButton } from '../ActionButton'
import { BackButton } from '../Button'

import { AppRoutes } from '@/config/constants/routes'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import * as S from './PageHeader.styles'

export const PageHeader: FC = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const { t } = useTranslation('common')
	const navigate = useNavigate()
	const location = useLocation()
	const { headerTitle, collapseSidebar, setCollapseSidebar, setTopHeaderHeight } = useAppStore()

	const backButtonHidden =
		location.pathname === AppRoutes.ANIMALS ||
		location.pathname === AppRoutes.EMPLOYEES ||
		location.pathname === AppRoutes.TASKS ||
		location.pathname === AppRoutes.MY_ACCOUNT ||
		location.pathname === AppRoutes.MY_SPECIES

	const handleBack = () => {
		navigate(-1)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect every time location changes
	useEffect(() => {
		const element = document.getElementById('pageHeader')
		const height = element?.clientHeight
		setTopHeaderHeight(height || 0)
	}, [user, location])

	return (
		<S.PageHeader id="pageHeader" $backButtonHidden={backButtonHidden}>
			<S.Sidebar
				$collapse={collapseSidebar}
				$backButtonHidden={backButtonHidden}
				// $disabled={!user}
				onClick={() => setCollapseSidebar(!collapseSidebar)}
			>
				{!collapseSidebar && <S.SidebarTitle>{farm!.name}</S.SidebarTitle>}
				<S.SidebarCloseButton>
					<ActionButton
						disabled={!user}
						icon={collapseSidebar ? 'i-ic-baseline-menu' : 'i-ic-baseline-menu-open'}
					/>
				</S.SidebarCloseButton>
			</S.Sidebar>
			{!backButtonHidden && (
				<BackButton disabled={!user} onClick={handleBack}>
					{t('header.return')}
				</BackButton>
			)}
			<S.Title>{headerTitle}</S.Title>
		</S.PageHeader>
	)
}
