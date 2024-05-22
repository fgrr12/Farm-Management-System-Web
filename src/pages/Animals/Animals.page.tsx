import { AppRoutes } from '@/config/constants/routes'
import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from 'react'
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
import { AnimalsService } from '@/services/animals'
import { useAppStore } from '@/store/useAppStore'
import { useTranslation } from 'react-i18next'
import * as S from './Animals.styles'

export const Animals = () => {
	const navigation = useNavigate()
	const { t, i18n } = useTranslation()
	const { defaultModalData, setLoading, setModalData } = useAppStore()
	const [animals, setAnimals] = useState<AnimalCardInformation[]>([])
	const [species, setSpecies] = useState<string[]>([])
	const [filters, setFilters] = useState<AnimalsFilters>(INITIAL_FILTERS)

	const navigateToAnimal = (uuid: string) => {
		const path = AppRoutes.ANIMAL.replace(':animalUuid', uuid)
		navigation(path)
	}

	const handleSearchKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
		const { value } = event.target as HTMLInputElement
		if (event.key === 'Enter') {
			setFilters((prev) => ({ ...prev, search: value }))
		}
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setFilters((prev) => ({ ...prev, [name]: value }))
	}

	const getAnimals = async () => {
		try {
			setLoading(true)
			const { selectedSpecies, search } = filters
			const dbAnimals = await AnimalsService.getAnimals({ selectedSpecies, search })

			setAnimals(dbAnimals)
		} catch (error) {
			setModalData({
				open: true,
				title: 'Error',
				message: 'Ocurrió un error al obtener los animales',
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	const getSpecies = async () => {
		try {
			const dbSpecies = await AnimalsService.getSpecies()

			setSpecies(dbSpecies)
		} catch (error) {
			setModalData({
				open: true,
				title: 'Error',
				message: 'Ocurrió un error al obtener las especies',
				onAccept: () => setModalData(defaultModalData),
			})
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: This error is due to withFetching HOF
	useEffect(() => {
		setLoading(true)
		i18n.changeLanguage('esp')
		getSpecies()
		getAnimals()
	}, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: This error is due to withFetching HOF
	useEffect(() => {
		getAnimals()
	}, [filters])

	return (
		<S.Container>
			<PageHeader>{t('animals.title')}</PageHeader>
			<S.ButtonContainer>
				<Search placeholder={t('animals.search')} onKeyDown={handleSearchKeyPress} />
				<Select name="selectedSpecies" label={t('animals.species')} onChange={handleSelectChange}>
					<option value="all">{t('animals.all')}</option>
					{species.length > 0 &&
						species.map((specie) => (
							<option key={specie} value={specie}>
								{t(`species.${specie.toLowerCase()}`)}
							</option>
						))}
				</Select>
				<Button onClick={() => navigation(AppRoutes.ADD_ANIMAL)}>{t('animals.addAnimal')}</Button>
			</S.ButtonContainer>
			<S.AnimalsContainer>
				{animals.map((animal) => (
					<AnimalCard
						key={crypto.randomUUID()}
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
	search: '',
}
