import { AppRoutes } from '@/config/constants/routes'
import firestoreHandler from '@/config/persistence/firestoreHandler'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Components
import { AnimalCard } from '@/components/business/Animals/AnimalCard'
import { PageHeader } from '@/components/ui/PageHeader'

//Types
import type { AnimalCardInformation } from './Animals.types'

// Styles
import * as S from './Animals.styles'

export const Animals = () => {
	const navigation = useNavigate()
	const [animals, setAnimals] = useState<AnimalCardInformation[]>([])

	const navigateToAnimal = (uuid: string) => {
		const path = AppRoutes.ANIMAL.replace(':animalUuid', uuid)
		navigation(path)
	}

	const getAnimals = async () => {
		const dbAnimals = (await firestoreHandler.getCollection('animals')) as AnimalCardInformation[]
		setAnimals(dbAnimals)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: This error is due to withFetching HOF
	useEffect(() => {
		getAnimals()
	}, [])

	return (
		<S.Container>
			<PageHeader>Animales</PageHeader>
			<S.AnimalsContainer>
				{animals.map((animal) => (
					<AnimalCard
						key={animal.uuid}
						animalId={animal.animalId}
						species={animal.species}
						breed={animal.breed}
						birthDate={animal.birthDate}
						gender={animal.gender}
						color={animal.color}
						onClick={() => navigateToAnimal(animal.uuid)}
					/>
				))}
			</S.AnimalsContainer>
		</S.Container>
	)
}
