// Components
import { AnimalCard } from '@/components/business/Animals/AnimalCard'

// Styles
import { AppRoutes } from '@/config/constants/routes'
import { animalsMock } from '@/mocks/Animals/Animals.mock'
import { useNavigate } from 'react-router-dom'
import * as S from './Animals.styles'

export const Animals = () => {
	const navigation = useNavigate()

	const navigateToAnimal = (animalId: string) => {
		const path = AppRoutes.ANIMAL.replace(':animalId', animalId)
		navigation(path)
	}

	return (
		<S.Container>
			<S.AnimalsContainer>
				{animalsMock.map((animal) => (
					<AnimalCard
						key={animal.animalId}
						animalId={animal.animalId}
						species={animal.species}
						breed={animal.breed}
						birthDate={animal.birthDate}
						gender={animal.gender}
						color={animal.color}
						onClick={() => navigateToAnimal(animal.animalId.toString())}
					/>
				))}
			</S.AnimalsContainer>
		</S.Container>
	)
}
