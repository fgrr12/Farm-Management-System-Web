import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { BackButton } from '../Button'

import { useAppStore } from '@/store/useAppStore'

import * as S from './PageHeader.styles'

export const PageHeader: FC = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { headerTitle } = useAppStore()

	const handleBack = () => {
		navigate(-1)
	}

	return (
		<S.PageHeader>
			<BackButton onClick={handleBack}>{t('header.return')}</BackButton>
			<S.Title>{headerTitle}</S.Title>
		</S.PageHeader>
	)
}
