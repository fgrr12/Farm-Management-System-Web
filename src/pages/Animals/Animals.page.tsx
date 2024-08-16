import { AppRoutes } from '@/config/constants/routes'
import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AnimalCard } from '@/components/business/Animals/AnimalCard'
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { Select } from '@/components/ui/Select'

import { AnimalsService } from '@/services/animals'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import type { AnimalCardInformation, AnimalsFilters } from './Animals.types'

import * as S from './Animals.styles'

export const Animals = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigation = useNavigate()
	const { t } = useTranslation(['animals'])
	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()

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
			const dbAnimals = await AnimalsService.getAnimals({
				selectedSpecies,
				search,
				farmUuid: farm!.uuid,
			})
			setAnimals(dbAnimals)
		} catch (error) {
			setModalData({
				open: true,
				title: t('modal.errorGettingAnimals.title'),
				message: t('modal.errorGettingAnimals.message'),
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		setLoading(true)
		setHeaderTitle(t('title'))
		if (user) {
			setSpecies(farm!.species)
			getAnimals()
		}
	}, [filters, user])

	return (
		<S.Container>
			<S.ButtonContainer>
				<Search placeholder={t('search')} onKeyDown={handleSearchKeyPress} />
				<Select name="selectedSpecies" label={t('species')} onChange={handleSelectChange}>
					<option value="all">{t('all')}</option>
					{species.length > 0 &&
						species.map((specie, index) => (
							<option key={index} value={specie}>
								{specie}
							</option>
						))}
				</Select>
				<Button onClick={() => navigation(AppRoutes.ADD_ANIMAL)}>{t('addAnimal')}</Button>
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
