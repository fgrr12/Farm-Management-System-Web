import { Button } from '../../../ui/Button'
import * as S from './HomeAnimalCard.styles'
import type { CardProps } from './HomeAnimalCard.types'

export const HomeAnimalCard: FC<CardProps> = ({
	animalId,
	animalKind,
	animalBreed,
	animalBirthDate,
	animalGender,
	animalColor,
	...props
}) => {
	return (
		<S.Card {...props}>
			<S.TopInfoContainer>
				<h2>{animalId}</h2>
				<h5>{animalBreed}</h5>
			</S.TopInfoContainer>
			<S.MiddleInfoContainer>
				<p>Date of Birth: {animalBirthDate.format('DD/MM/YYYY')}</p>
				<p>Gender: {animalGender}</p>
				<p>Color: {animalColor}</p>
			</S.MiddleInfoContainer>
			<Button>View</Button>
		</S.Card>
	)
}
