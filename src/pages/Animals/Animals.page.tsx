import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'

import { AnimalCard } from '@/components/business/Animals/AnimalCard'
import { AnimalFilters } from '@/components/business/Animals/AnimalFilters'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader, PageHeaderStats } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/SkeletonLoader'

import { useAnimals } from '@/hooks/queries/useAnimals'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { AnimalsFilters } from './Animals.types'

const Animals = () => {
	const { species, breeds } = useFarmStore()
	const navigation = useNavigate()
	const { t } = useTranslation(['animals'])
	const { setPageTitle } = usePagePerformance()
	const containerRef = useRef<HTMLDivElement>(null)

	const { data: dbAnimals, isLoading } = useAnimals()
	const [filters, setFilters] = useState(INITIAL_FILTERS)

	const animals = useMemo(() => {
		if (!dbAnimals) return []

		return dbAnimals.map((animal) => {
			const speciesName = species.find((sp) => sp.uuid === animal.speciesUuid)?.name || ''
			const breedName = breeds.find((br) => br.uuid === animal.breedUuid)?.name || ''

			return {
				...animal,
				speciesName,
				breedName,
				healthStatus: animal.healthStatus,
			}
		})
	}, [dbAnimals, species, breeds])

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

	// Calculate total animals in farm (excluding dead animals)
	const totalAnimalsInFarm = useMemo(() => {
		return animals.filter((animal) => !animal.deathDate).length
	}, [animals])

	const handleFiltersChange = useCallback((newFilters: AnimalsFilters) => {
		setFilters(newFilters)
	}, [])

	const navigateToAddAnimal = useCallback(() => {
		navigation(AppRoutes.ADD_ANIMAL)
	}, [navigation])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	useGSAP(() => {
		if (!filteredAnimals.length) return

		const cards = containerRef.current?.querySelectorAll('.animal-card')

		if (cards && cards.length > 0) {
			const animation = gsap.from(cards, {
				opacity: 0,
				x: 30,
				stagger: 0.1,
				duration: 0.5,
				ease: 'power2.out',
				clearProps: 'opacity,transform',
			})

			return () => {
				// Kill the animation if component unmounts or filteredAnimals changes
				if (animation) {
					animation.kill()
				}
				// Kill any remaining tweens on the cards
				gsap.killTweensOf(cards)
			}
		}
	}, [filteredAnimals])

	return (
		<PageContainer>
			<a
				href="#animals-grid"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 dark:bg-blue-500 text-white p-2 rounded z-50"
			>
				{t('accessibility.skipToAnimals')}
			</a>

			<PageHeader
				icon="pets"
				title={t('title')}
				subtitle={t('subtitle', { count: filteredAnimals.length })}
				stats={
					<PageHeaderStats
						stats={[
							{
								value: filteredAnimals.length,
								label: filteredAnimals.length !== animals.length ? t('filtered') : t('showing'),
							},
							{ value: totalAnimalsInFarm, label: t('inFarm') },
							{ value: animals.length, label: t('allAnimals') },
						]}
					/>
				}
				actions={
					<section aria-labelledby="filters-heading" role="search">
						<h2 id="filters-heading" className="sr-only">
							{t('accessibility.filtersSection')}
						</h2>

						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex-1 min-w-0">
								<AnimalFilters
									filters={filters}
									onFiltersChange={handleFiltersChange}
									species={species}
								/>
							</div>

							<div className="shrink-0">
								<Button
									type="button"
									className="btn btn-primary h-12 text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
									onClick={navigateToAddAnimal}
									aria-describedby="add-animal-description"
								>
									<i className="i-material-symbols-add-circle-outline w-6! h-6! mr-2" />
									{t('addAnimal')}
								</Button>
								<div id="add-animal-description" className="sr-only">
									{t('accessibility.addAnimalDescription')}
								</div>
							</div>
						</div>
					</section>
				}
			/>

			{/* Animals Grid Section */}
			<section aria-labelledby="animals-heading" aria-live="polite" aria-atomic="false">
				<h2 id="animals-heading" className="sr-only">
					{t('accessibility.animalsListHeading')} ({filteredAnimals.length}{' '}
					{t('accessibility.results')})
				</h2>

				{isLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
						<CardSkeleton count={8} />
					</div>
				) : filteredAnimals.length > 0 ? (
					<div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300">
						{/* Glass Reflection Overlay */}
						<div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

						<div className="p-4 sm:p-6 relative z-10">
							<div
								ref={containerRef}
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6"
								id="animals-grid"
								role="list"
								aria-label={t('accessibility.animalsGrid', { count: filteredAnimals.length })}
							>
								{filteredAnimals.map((animal) => (
									<div key={animal.uuid} role="listitem" className="animal-card">
										<AnimalCard
											animal={animal}
											aria-label={t('accessibility.animalCardLabel', {
												animalId: animal.animalId,
												breedName: animal.breedName,
												gender: animal.gender,
											})}
										/>
									</div>
								))}
							</div>
						</div>
					</div>
				) : (
					<EmptyState
						icon="pets"
						title={t('noAnimals')}
						description={t('noAnimalsSubtitle')}
						action={{
							label: t('addFirstAnimal'),
							onClick: navigateToAddAnimal,
							icon: 'add-circle-outline',
						}}
					/>
				)}
			</section>
		</PageContainer>
	)
}

const INITIAL_FILTERS: AnimalsFilters = {
	speciesUuid: '',
	gender: 'female',
	status: 'inFarm',
	search: '',
}

export default memo(Animals)
