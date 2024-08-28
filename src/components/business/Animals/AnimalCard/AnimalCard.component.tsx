import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { Button } from '../../../ui/Button'

import type { CardProps } from './AnimalCard.types'

import * as S from './AnimalCard.styles'

export const AnimalCard: FC<CardProps> = ({
	animalId,
	species: animalKind,
	breed: animalBreed,
	birthDate: animalBirthDate,
	gender: animalGender,
	color: animalColor,
	...props
}) => {
	const { t } = useTranslation(['animalCard'])
	return (
		<S.Card {...props}>
			<S.TopInfoContainer>
				<h2>{animalId}</h2>
				<h5>{animalBreed}</h5>
			</S.TopInfoContainer>
			<S.MiddleInfoContainer>
				<p>
					{t('birthDate')}: {dayjs(animalBirthDate).format('DD/MM/YYYY')}
				</p>
				<p>
					{t('gender')}: {t(`genderList.${animalGender.toLowerCase()}`)}
					<S.GenderIcon
						className={`i-mdi-gender-${animalGender.toLowerCase()}`}
						$gender={animalGender}
					/>
				</p>
				<p>
					{t('color')}: {animalColor}
				</p>
			</S.MiddleInfoContainer>
			<Button>{t('view')}</Button>
		</S.Card>
	)
}
