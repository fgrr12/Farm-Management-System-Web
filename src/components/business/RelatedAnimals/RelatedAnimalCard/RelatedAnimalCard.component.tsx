import { useTranslation } from 'react-i18next'

import type { CardProps } from './RelatedAnimalCard.types'

import * as S from './RelatedAnimalCard.styles'

export const RelatedAnimalCard: FC<CardProps> = ({
	animalId,
	breed,
	gender,
	picture,
	...props
}) => {
	const { t } = useTranslation(['relatedAnimalCard'])
	return (
		<S.Card {...props}>
			<S.ImageContainer>
				<img src={picture || '/assets/default-imgs/cow.svg'} alt="Animal" />
			</S.ImageContainer>
			<S.MiddleInfoContainer>
				<p>
					{t('animalId')}: {animalId}
				</p>
				<p>
					{t('breed')}: {breed}
				</p>
				<p>
					{t('gender')}: {t(`genderList.${gender.toLowerCase()}`)}
					<S.GenderIcon className={`i-mdi-gender-${gender.toLowerCase()}`} $gender={gender} />
				</p>
			</S.MiddleInfoContainer>
		</S.Card>
	)
}
