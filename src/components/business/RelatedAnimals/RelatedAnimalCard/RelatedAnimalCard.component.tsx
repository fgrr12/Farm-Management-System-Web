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
	const { t } = useTranslation()
	return (
		<S.Card {...props}>
			<S.ImageContainer>
				<img src={picture} alt="Animal" />
			</S.ImageContainer>
			<S.MiddleInfoContainer>
				<p>
					{t('relatedAnimalCard.animalId')}: {animalId}
				</p>
				<p>
					{t('relatedAnimalCard.breed')}: {breed}
				</p>
				<p>
					{t('relatedAnimalCard.gender')}: {gender}
				</p>
			</S.MiddleInfoContainer>
		</S.Card>
	)
}
