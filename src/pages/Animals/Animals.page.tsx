import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { AnimalsService } from '@/services/animals'

import { AnimalCard } from '@/components/business/Animals/AnimalCard'
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { Select } from '@/components/ui/Select'

import type { AnimalCardProps, AnimalsFilters } from './Animals.types'

const Animals = () => {
	const { user } = useUserStore()
	const { farm, species, breeds } = useFarmStore()
	const navigation = useNavigate()
	const { t } = useTranslation(['animals'])
	const { setLoading, setHeaderTitle, setToastData } = useAppStore()
	const containerRef = useRef<HTMLDivElement>(null)

	const [animals, setAnimals] = useState<AnimalCardProps[]>([])
	const [filters, setFilters] = useState(INITIAL_FILTERS)

	const genderOptions = [
		{ value: 'female', name: t('gender.female') },
		{ value: 'male', name: t('gender.male') },
	]

	const statusOptions = [
		{ value: 'inFarm', name: t('status.inFarm') },
		{ value: 'dead', name: t('status.dead') },
		{ value: 'sold', name: t('status.sold') },
	]

	const speciesOptions = useMemo(
		() => species.map((specie) => ({ value: specie.uuid, name: specie.name })),
		[species]
	)

	const filteredAnimals = useMemo(() => {
		if (!animals.length) return []

		const { speciesUuid, search, gender, status } = filters
		const normalizedSearch = search?.toLowerCase()

		return animals.filter((animal) => {
			const matchesSpecies = !speciesUuid || animal.speciesUuid === speciesUuid
			const matchesGender = !gender || animal.gender.toLowerCase() === gender
			const matchesSearch =
				!normalizedSearch || animal.animalId.toLowerCase().includes(normalizedSearch)

			let matchesStatus = true
			switch (status) {
				case 'sold':
					matchesStatus = !!animal.soldDate
					break
				case 'dead':
					matchesStatus = !!animal.deathDate
					break
				case 'inFarm':
					matchesStatus = !animal.soldDate && !animal.deathDate
					break
			}

			return matchesSpecies && matchesGender && matchesStatus && matchesSearch
		})
	}, [animals, filters])

	const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target as HTMLInputElement
		setFilters((prev) => ({ ...prev, search: value }))
	}, [])

	const handleSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setFilters((prev) => ({ ...prev, [name]: value }))
	}, [])

	const navigateToAddAnimal = () => {
		navigation(AppRoutes.ADD_ANIMAL)
	}

	const getAnimals = async () => {
		setLoading(true)

		try {
			const dbAnimals = await AnimalsService.getAnimals(farm!.uuid)

			const enrichedAnimals: AnimalCardProps[] = dbAnimals.map((animal) => {
				const speciesName = species.find((sp) => sp.uuid === animal.speciesUuid)!.name
				const breedName = breeds.find((br) => br.uuid === animal.breedUuid)!.name

				return {
					...animal,
					speciesName,
					breedName,
				}
			})

			setAnimals(enrichedAnimals)
		} catch (error) {
			console.error('Error loading animals:', error)

			setToastData({
				message: t('toast.errorGettingAnimals'),
				type: 'error',
			})
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		setHeaderTitle(t('title'))
	}, [setHeaderTitle, t])

	// biome-ignore lint:: UseEffect is only called once
	useEffect(() => {
		if (!user || !farm) return
		getAnimals()
	}, [user, farm])

	useGSAP(() => {
		if (!filteredAnimals.length) return

		const cards = containerRef.current?.querySelectorAll('.animal-card')

		if (cards && cards.length > 0) {
			gsap.from(cards, {
				opacity: 0,
				x: 30,
				stagger: 0.1,
				duration: 0.5,
				ease: 'power2.out',
				clearProps: 'opacity,transform',
			})
		}
	}, [filteredAnimals])
	return (
		<div className="flex flex-col gap-5 p-4 w-full h-full overflow-auto relative pb-18">
			<div className="flex flex-col md:grid md:grid-cols-6 items-center justify-center md:gap-4 w-full">
				<Search placeholder={t('search')} value={filters.search} onChange={handleSearchChange} />
				<Select
					name="speciesUuid"
					legend={t('filterBySpecies')}
					defaultLabel={t('filterBySpecies')}
					value={filters.speciesUuid}
					items={speciesOptions}
					onChange={handleSelectChange}
				/>
				<Select
					name="gender"
					legend={t('filterByGender')}
					defaultLabel={t('filterByGender')}
					value={filters.gender}
					items={genderOptions}
					onChange={handleSelectChange}
				/>
				<Select
					name="status"
					legend={t('filterByStatus')}
					defaultLabel={t('filterByStatus')}
					value={filters.status}
					items={statusOptions}
					onChange={handleSelectChange}
				/>
				<Button
					type="button"
					className="btn btn-primary h-12 w-full text-lg col-start-6 mt-4 md:mt-0"
					onClick={navigateToAddAnimal}
				>
					{t('addAnimal')}
				</Button>
			</div>
			<div
				ref={containerRef}
				className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 w-full"
			>
				{filteredAnimals.map((animal) => (
					<AnimalCard
						key={animal.uuid}
						uuid={animal.uuid}
						animalId={animal.animalId}
						breedName={animal.breedName}
						gender={animal.gender}
					/>
				))}
			</div>
			{filteredAnimals.length === 0 && (
				<div className="flex flex-col items-center justify-center gap-2 w-full">
					<div className="text-center text-2xl font-bold">{t('noAnimals')}</div>
					<div className="text-center text-sm font-semibold">{t('noAnimalsSubtitle')}</div>
				</div>
			)}
			<div className="fixed bottom-4 left-4 lg:left-23 shadow-md rounded-lg p-2 text-center bg-blue-100">
				<p>
					<Trans ns="animals" i18nKey="totalFilteredAnimals" count={filteredAnimals.length} />
				</p>
			</div>
		</div>
	)
}

const INITIAL_FILTERS: AnimalsFilters = {
	speciesUuid: '',
	gender: 'female',
	status: 'inFarm',
	search: '',
}

export default Animals
