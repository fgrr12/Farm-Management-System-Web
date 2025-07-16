import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type ChangeEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { AnimalsService } from '@/services/animals'

import { AnimalCard } from '@/components/business/Animals/AnimalCard'
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { Select } from '@/components/ui/Select'

import { usePagePerformance } from '@/hooks/usePagePerformance'

import type { AnimalCardProps, AnimalsFilters } from './Animals.types'

const Animals = () => {
	const { user } = useUserStore()
	const { farm, species, breeds } = useFarmStore()
	const navigation = useNavigate()
	const { t } = useTranslation(['animals'])
	const { setPageTitle, withLoadingAndError } = usePagePerformance()
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

	const navigateToAddAnimal = useCallback(() => {
		navigation(AppRoutes.ADD_ANIMAL)
	}, [navigation])

	const getAnimals = useCallback(async () => {
		await withLoadingAndError(async () => {
			if (!farm?.uuid) return []

			const dbAnimals = await AnimalsService.getAnimals(farm.uuid)

			const enrichedAnimals: AnimalCardProps[] = dbAnimals.map((animal) => {
				const speciesName = species.find((sp) => sp.uuid === animal.speciesUuid)?.name || ''
				const breedName = breeds.find((br) => br.uuid === animal.breedUuid)?.name || ''

				return {
					...animal,
					speciesName,
					breedName,
				}
			})

			setAnimals(enrichedAnimals)
			return enrichedAnimals
		}, t('toast.errorGettingAnimals'))
	}, [farm?.uuid, species, breeds, withLoadingAndError, t])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	useEffect(() => {
		if (!user || !farm) return
		getAnimals()
	}, [user, farm, getAnimals])

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
			<a
				href="#animals-grid"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
			>
				{t('accessibility.skipToAnimals')}
			</a>

			<header>
				<h1 className="sr-only">{t('title')}</h1>
			</header>

			<section aria-labelledby="filters-heading" role="search">
				<h2 id="filters-heading" className="sr-only">
					{t('accessibility.filtersSection')}
				</h2>
				<div className="flex flex-col md:grid md:grid-cols-6 items-center justify-center md:gap-4 w-full">
					<Search
						placeholder={t('search')}
						value={filters.search}
						onChange={handleSearchChange}
						aria-label={t('accessibility.searchAnimals')}
					/>
					<Select
						name="speciesUuid"
						legend={t('filterBySpecies')}
						defaultLabel={t('filterBySpecies')}
						value={filters.speciesUuid}
						items={speciesOptions}
						onChange={handleSelectChange}
						aria-label={t('filterBySpecies')}
					/>
					<Select
						name="gender"
						legend={t('filterByGender')}
						defaultLabel={t('filterByGender')}
						value={filters.gender}
						items={genderOptions}
						onChange={handleSelectChange}
						aria-label={t('filterByGender')}
					/>
					<Select
						name="status"
						legend={t('filterByStatus')}
						defaultLabel={t('filterByStatus')}
						value={filters.status}
						items={statusOptions}
						onChange={handleSelectChange}
						aria-label={t('filterByStatus')}
					/>
					<Button
						type="button"
						className="btn btn-primary h-12 w-full text-lg col-start-6 mt-4 md:mt-0"
						onClick={navigateToAddAnimal}
						aria-describedby="add-animal-description"
					>
						{t('addAnimal')}
					</Button>
					<div id="add-animal-description" className="sr-only">
						{t('accessibility.addAnimalDescription')}
					</div>
				</div>
			</section>

			<section aria-labelledby="animals-heading" aria-live="polite" aria-atomic="false">
				<h2 id="animals-heading" className="sr-only">
					{t('accessibility.animalsListHeading')} ({filteredAnimals.length}{' '}
					{t('accessibility.results')})
				</h2>
				<div
					ref={containerRef}
					className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 w-full"
					id="animals-grid"
					role="list"
					aria-label={t('accessibility.animalsGrid', { count: filteredAnimals.length })}
				>
					{filteredAnimals.map((animal) => (
						<div key={animal.uuid} role="listitem">
							<AnimalCard
								uuid={animal.uuid}
								animalId={animal.animalId}
								breedName={animal.breedName}
								gender={animal.gender}
								aria-label={t('accessibility.animalCardLabel', {
									animalId: animal.animalId,
									breedName: animal.breedName,
									gender: animal.gender,
								})}
							/>
						</div>
					))}
				</div>

				{filteredAnimals.length === 0 && (
					<div
						className="flex flex-col items-center justify-center gap-2 w-full"
						role="status"
						aria-live="polite"
					>
						<h3 className="text-center text-2xl font-bold">{t('noAnimals')}</h3>
						<p className="text-center text-sm font-semibold">{t('noAnimalsSubtitle')}</p>
					</div>
				)}
			</section>

			<aside
				className="fixed bottom-4 left-4 lg:left-23 shadow-md rounded-lg p-2 text-center bg-blue-100"
				role="status"
				aria-live="polite"
				aria-label={t('accessibility.resultsCounter')}
			>
				<p>
					<Trans ns="animals" i18nKey="totalFilteredAnimals" count={filteredAnimals.length} />
				</p>
			</aside>
		</div>
	)
}

const INITIAL_FILTERS: AnimalsFilters = {
	speciesUuid: '',
	gender: 'female',
	status: 'inFarm',
	search: '',
}

export default memo(Animals)
