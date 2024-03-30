// Components
import { AnimalCard } from '@/components/business/Animals/AnimalCard'

// Styles
import { AppRoutes } from '@/config/constants/routes'
import firestoreHandler from '@/config/persistence/firestoreHandler'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as S from './Animals.styles'
import type { IAnimalCard } from './Animals.types'

export const Animals = () => {
	const navigation = useNavigate()
	const [animals, setAnimals] = useState<IAnimalCard[]>([])

	const navigateToAnimal = (animalId: string) => {
		const path = AppRoutes.ANIMAL.replace(':animalId', animalId)
		navigation(path)
	}

	const getAnimals = async () => {
		const dbAnimals = (await firestoreHandler.getCollection('animals')) as IAnimalCard[]
		setAnimals(dbAnimals)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: This error is due to withFetching HOF
	useEffect(() => {
		getAnimals()
	}, [])

	return (
		<S.Container>
			<S.AnimalsContainer>
				{animals.map((animal) => (
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
