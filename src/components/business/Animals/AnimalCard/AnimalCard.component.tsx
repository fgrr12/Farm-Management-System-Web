import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { Button } from '../../../ui/Button'

import type { CardProps } from './AnimalCard.types'

import * as S from './AnimalCard.styles'

export const AnimalCard: FC<CardProps> = ({
	animalId,
	species,
	breed,
	birthDate,
	gender,
	color,
	...props
}) => {
	const { t } = useTranslation(['animalCard'])
	return (
		<S.Card {...props}>
			<S.TopInfoContainer>
				<h2>{animalId}</h2>
				<h5>{breed.name}</h5>
			</S.TopInfoContainer>
			<S.MiddleInfoContainer>
				<p>
					{t('birthDate')}: {dayjs(birthDate).format('DD/MM/YYYY')}
				</p>
				<p>
					{t('gender')}: {t(`genderList.${gender.toLowerCase()}`)}
					<S.GenderIcon className={`i-mdi-gender-${gender.toLowerCase()}`} $gender={gender} />
				</p>
				<p>
					{t('color')}: {color}
				</p>
			</S.MiddleInfoContainer>
			<Button>{t('view')}</Button>
		</S.Card>
	)
}
