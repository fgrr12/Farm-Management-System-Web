import { AppRoutes } from '@/config/constants/routes'
import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AnimalCard } from '@/components/business/Animals/AnimalCard'
import { Search } from '@/components/ui/Search'
import { Select } from '@/components/ui/Select'

import { AnimalsService } from '@/services/animals'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import type { AnimalsFilters } from './Animals.types'

export const Animals = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigation = useNavigate()
	const { t } = useTranslation(['animals'])
	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()

	const [animals, setAnimals] = useState<Animal[]>([])
	const [species, setSpecies] = useState<Species[]>([])
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
			const { speciesUuid, search } = filters
			const dbAnimals = await AnimalsService.getAnimals({
				speciesUuid,
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
		if (user && farm) {
			setSpecies(farm.species!)
			getAnimals()
		}
	}, [filters, user])

	useEffect(() => {
		setHeaderTitle(t('title'))
	}, [setHeaderTitle, t])

	return (
		<div className="flex flex-col gap-5 p-4 w-full h-full overflow-auto">
			<div className="flex flex-col md:grid md:grid-cols-4 items-center justify-center gap-4 w-full">
				<Search placeholder={t('search')} onKeyDown={handleSearchKeyPress} />
				<Select
					name="selectedSpecies"
					legend={t('filterBySpecies')}
					defaultLabel={t('filterBySpecies')}
					value={filters.speciesUuid}
					items={[...species.map((specie) => ({ value: specie.uuid, name: specie.name }))]}
					onChange={handleSelectChange}
				/>
				<button
					type="button"
					className="btn btn-primary h-12 w-full text-lg col-start-4"
					onClick={() => navigation(AppRoutes.ADD_ANIMAL)}
				>
					{t('addAnimal')}
				</button>
			</div>
			<div className="flex flex-col md:grid md:grid-cols-6 items-center justify-center gap-4 w-full">
				{animals.map((animal) => (
					<AnimalCard
						key={crypto.randomUUID()}
						animalId={animal.animalId}
						breed={animal.breed}
						gender={animal.gender}
						onClick={() => navigateToAnimal(animal.uuid)}
					/>
				))}
			</div>
			{animals.length === 0 && (
				<div className="flex flex-col items-center justify-center gap-2 w-full">
					<div className="text-center text-2xl font-bold">{t('noAnimals')}</div>
					<div className="text-center text-sm font-semibold">{t('noAnimalsSubtitle')}</div>
				</div>
			)}
		</div>
	)
}

const INITIAL_FILTERS: AnimalsFilters = {
	speciesUuid: '',
	search: '',
}
