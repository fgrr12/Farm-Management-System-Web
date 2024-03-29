// Components
import { HomeAnimalCard } from '@/components/business/Home/HomeAnimalCard'

// Styles
import { AppRoutes } from '@/config/constants/routes'
import { animalsMock } from '@/mocks/Home/Home.mock'
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
					<HomeAnimalCard
						key={animal.animalId}
						animalId={animal.animalId}
						animalKind={animal.animalKind}
						animalBreed={animal.animalBreed}
						animalBirthDate={animal.animalBirthDate}
						animalGender={animal.animalGender}
						animalColor={animal.animalColor}
						onClick={() => navigateToAnimal(animal.animalId.toString())}
					/>
				))}
			</S.AnimalsContainer>
		</S.Container>
	)
}
