import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { AnimalsService } from '@/services/animals'

import { AnimalCard } from '@/components/business/Animals/AnimalCard'
import { AnimalFilters } from '@/components/business/Animals/AnimalFilters'
import { Button } from '@/components/ui/Button'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

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

	const handleFiltersChange = useCallback((newFilters: AnimalsFilters) => {
		setFilters(newFilters)
	}, [])

	const navigateToAddAnimal = useCallback(() => {
		navigation(AppRoutes.ADD_ANIMAL)
	}, [navigation])

	const getAnimals = useCallback(async () => {
		await withLoadingAndError(async () => {
			if (!farm?.uuid) return []

			const dbAnimals = await AnimalsService.getAnimalsWithHealthStatus(farm.uuid)

			const enrichedAnimals: AnimalCardProps[] = dbAnimals.map((animal) => {
				const speciesName = species.find((sp) => sp.uuid === animal.speciesUuid)?.name || ''
				const breedName = breeds.find((br) => br.uuid === animal.breedUuid)?.name || ''

				return {
					...animal,
					speciesName,
					breedName,
					healthStatus: animal.healthStatus,
					lastHealthCheck: animal.lastHealthCheck,
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
		<div className="min-h-screen md:min-h-full bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				<a
					href="#animals-grid"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 dark:bg-blue-500 text-white p-2 rounded z-50"
				>
					{t('accessibility.skipToAnimals')}
				</a>

				{/* Hero Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700">
					<div className="bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-700 dark:to-green-700 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex items-center gap-3 sm:gap-4">
								<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 dark:bg-white/25 rounded-full flex items-center justify-center flex-shrink-0">
									<i className="i-material-symbols-pets bg-white! w-6! h-6! sm:w-8 sm:h-8" />
								</div>
								<div className="min-w-0">
									<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
										{t('title')}
									</h1>
									<p className="text-blue-100 dark:text-blue-200 text-sm sm:text-base mt-1">
										{t('subtitle', { count: filteredAnimals.length })}
									</p>
								</div>
							</div>

							{/* Stats Cards */}
							<div className="flex gap-2 sm:gap-4">
								<div className="bg-white/10 dark:bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-white/20 dark:border-white/25">
									<div className="text-lg sm:text-xl font-bold text-white">
										{filteredAnimals.length}
									</div>
									<div className="text-xs text-blue-100 dark:text-blue-200">
										{filteredAnimals.length !== animals.length ? t('filtered') : t('total')}
									</div>
								</div>
								<div className="bg-white/10 dark:bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-white/20 dark:border-white/25">
									<div className="text-lg sm:text-xl font-bold text-white">{animals.length}</div>
									<div className="text-xs text-blue-100 dark:text-blue-200">{t('allAnimals')}</div>
								</div>
							</div>
						</div>
					</div>

					{/* Filters and Actions Bar */}
					<div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
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

								<div className="flex-shrink-0">
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
					</div>
				</div>

				{/* Animals Grid Section */}
				<section aria-labelledby="animals-heading" aria-live="polite" aria-atomic="false">
					<h2 id="animals-heading" className="sr-only">
						{t('accessibility.animalsListHeading')} ({filteredAnimals.length}{' '}
						{t('accessibility.results')})
					</h2>

					{filteredAnimals.length > 0 ? (
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
							{/* Animals Grid */}
							<div className="p-4 sm:p-6">
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
						/* Empty State */
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
							<div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
								<div
									className="flex flex-col items-center justify-center gap-4 sm:gap-6"
									role="status"
									aria-live="polite"
								>
									<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600">
										<i className="i-material-symbols-pets w-8! h-8! sm:w-10 sm:h-10 bg-gray-400 dark:bg-gray-500!" />
									</div>
									<div className="space-y-2">
										<h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
											{t('noAnimals')}
										</h3>
										<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
											{t('noAnimalsSubtitle')}
										</p>
									</div>
									<Button
										type="button"
										className="btn btn-primary mt-4"
										onClick={navigateToAddAnimal}
									>
										<i className="i-material-symbols-add-circle-outline w-6! h-6! mr-2" />
										{t('addFirstAnimal')}
									</Button>
								</div>
							</div>
						</div>
					)}
				</section>
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

export default memo(Animals)
