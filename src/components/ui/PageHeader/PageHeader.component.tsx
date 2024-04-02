import { AppRoutes } from '@/config/constants/routes'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '../Button'
import * as S from './PageHeader.styles'
import type { PageHeaderProps } from './PageHeader.types'

export const PageHeader: FC<PageHeaderProps> = ({ onBack, ...rest }) => {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const handleBack = () => {
		navigate(AppRoutes.ANIMALS)
	}

	return (
		<S.PageHeader {...rest}>
			<BackButton onClick={onBack ? onBack : handleBack}>{t('header.return')}</BackButton>
			<S.Title>{rest.children}</S.Title>
		</S.PageHeader>
	)
}
