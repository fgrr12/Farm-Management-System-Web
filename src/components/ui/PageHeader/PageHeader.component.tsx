import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { BackButton, Button } from '../Button'

import { AppRoutes } from '@/config/constants/routes'
import { UserService } from '@/services/user'

import type { PageHeaderProps } from './PageHeader.types'

import * as S from './PageHeader.styles'

export const PageHeader: FC<PageHeaderProps> = ({ onBack, ...rest }) => {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const handleBack = () => {
		navigate(AppRoutes.ANIMALS)
	}

	const logout = async () => {
		await UserService.logout()
		navigate(AppRoutes.LOGIN)
	}

	return (
		<S.PageHeader {...rest}>
			<BackButton onClick={onBack ? onBack : handleBack}>{t('header.return')}</BackButton>
			<S.Title>{rest.children}</S.Title>
			<Button onClick={logout}>Logout</Button>
		</S.PageHeader>
	)
}
