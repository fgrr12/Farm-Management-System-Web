import dayjs from 'dayjs'
import { Button } from '../../../ui/Button'
import * as S from './AnimalCard.styles'
import type { CardProps } from './AnimalCard.types'

export const AnimalCard: FC<CardProps> = ({
	animalId,
	species: animalKind,
	breed: animalBreed,
	birthDate: animalBirthDate,
	gender: animalGender,
	color: animalColor,
	...props
}) => {
	return (
		<S.Card {...props}>
			<S.TopInfoContainer>
				<h2>{animalId}</h2>
				<h5>{animalBreed}</h5>
			</S.TopInfoContainer>
			<S.MiddleInfoContainer>
				<p>Date of Birth: {dayjs(animalBirthDate).format('DD/MM/YYYY')}</p>
				<p>Gender: {animalGender}</p>
				<p>Color: {animalColor}</p>
			</S.MiddleInfoContainer>
			<Button>View</Button>
		</S.Card>
	)
}
