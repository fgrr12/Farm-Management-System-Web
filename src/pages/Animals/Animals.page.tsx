import { AppRoutes } from '@/config/constants/routes'
import firestoreHandler from '@/config/persistence/firestoreHandler'
import { useEffect, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'

// Components
import { AnimalCard } from '@/components/business/Animals/AnimalCard'
import { PageHeader } from '@/components/ui/PageHeader'

//Types
import type { AnimalCardInformation, AnimalsFilters } from './Animals.types'

// Styles
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { Select } from '@/components/ui/Select'
import { useAppStore } from '@/store/useAppStore'
import * as S from './Animals.styles'

export const Animals = () => {
	const navigation = useNavigate()
	const { defaultModalData, setLoading, setModalData } = useAppStore()
	const [animals, setAnimals] = useState<AnimalCardInformation[]>([])
	const [filters, setFilters] = useState<AnimalsFilters>(INITIAL_FILTERS)

	const navigateToAnimal = (uuid: string) => {
		const path = AppRoutes.ANIMAL.replace(':animalUuid', uuid)
		navigation(path)
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setFilters((prev) => ({ ...prev, [name]: value }))
	}

	const getAnimals = async () => {
		try {
			setLoading(true)
			const dbAnimals = (await firestoreHandler.getCollection('animals')) as AnimalCardInformation[]
			setAnimals(dbAnimals)
		} catch (error) {
			setModalData({
				open: true,
				title: 'Error',
				message: 'Ocurrió un error al obtener los animales',
				onAccept: () => defaultModalData,
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: This error is due to withFetching HOF
	useEffect(() => {
		getAnimals()
	}, [])

	//! Añadir tabla de producción (x fecha el animal produce x cantidad de leche)

	return (
		<S.Container>
			<PageHeader>Animales</PageHeader>
			<S.ButtonContainer>
				<Search />
				<Select label="Species" onChange={handleSelectChange}>
					<option value="all">All</option>
					<option value="cow">Cow</option>
					<option value="goat">Goat</option>
					<option value="sheep">Sheep</option>
				</Select>
				<Button onClick={() => navigation(AppRoutes.ADD_ANIMAL)}>Agregar animal</Button>
			</S.ButtonContainer>
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

const INITIAL_FILTERS: AnimalsFilters = {
	selectedSpecies: 'all',
	filter: '',
}
