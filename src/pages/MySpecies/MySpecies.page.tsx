import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'

import { BreedsService } from '@/services/breeds'
import { SpeciesService } from '@/services/species'

import { SpeciesFormCard } from '@/components/business/MySpecies/SpeciesFormCard'
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { MySpeciesI } from './MySpecies.types'

const MySpecies = () => {
	const { t } = useTranslation(['mySpecies'])
	const {
		breeds: dbBreeds,
		farm,
		species: dbSpecies,
		setBreeds: setDbBreeds,
		setSpecies: setDbSpecies,
	} = useFarmStore()
	const { defaultModalData, setModalData } = useAppStore()
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const [species, setSpecies] = useState<MySpeciesI[]>(INITIAL_SPECIES)
	const [breeds, setBreeds] = useState<Breed[]>(INITIAL_BREEDS)

	const handleSpecieChange = useCallback(
		(specieUuid: string, field: keyof Species, value: string | number) => {
			setSpecies((prev) =>
				prev.map((sp) => (sp.uuid === specieUuid ? { ...sp, [field]: value } : sp))
			)
		},
		[]
	)

	const handleBreedChange = useCallback(
		(breedUuid: string, field: keyof Breed, value: string | number) => {
			setBreeds((prev) =>
				prev.map((breed) => (breed.uuid === breedUuid ? { ...breed, [field]: value } : breed))
			)
		},
		[]
	)

	const handleAddSpecie = useCallback(() => {
		if (!farm?.uuid) return

		const specie: MySpeciesI = {
			uuid: crypto.randomUUID(),
			farmUuid: farm.uuid,
			name: '',
			editable: true,
		}
		setSpecies((prev) => [...prev, specie])
	}, [farm?.uuid])

	const handleAddBreed = useCallback(
		(specieUuid: string) => {
			if (!farm?.uuid) return

			const breed: Breed = {
				uuid: crypto.randomUUID(),
				speciesUuid: specieUuid,
				farmUuid: farm.uuid,
				name: '',
				gestationPeriod: 0,
			}
			setBreeds((prev) => [...prev, breed])
		},
		[farm?.uuid]
	)

	const handleEdit = useCallback((specieUuid: string) => {
		setSpecies((prev) =>
			prev.map((sp) => (sp.uuid === specieUuid ? { ...sp, editable: !sp.editable } : sp))
		)
	}, [])

	const handleRemoveSpecie = useCallback(
		(specieUuid: string) => {
			setModalData({
				open: true,
				title: t('modal.deleteSpecies.title'),
				message: t('modal.deleteSpecies.message'),
				onAccept: async () => {
					await withLoadingAndError(async () => {
						await BreedsService.deleteBreedsBySpecie(specieUuid)
						await SpeciesService.deleteSpecies(specieUuid)
						const sps = species.filter((specie) => specie.uuid !== specieUuid)
						setSpecies(sps)
						setDbSpecies(sps)
						setDbBreeds(breeds)
						setModalData(defaultModalData)
						showToast(t('toast.deletedSpecies'), 'success')
					}, t('toast.errorDeletingSpecies'))
				},
				onCancel: () => {
					setModalData(defaultModalData)
					showToast(t('toast.notDeletedSpecies'), 'info')
				},
			})
		},
		[
			species,
			breeds,
			setModalData,
			defaultModalData,
			withLoadingAndError,
			showToast,
			t,
			setDbSpecies,
			setDbBreeds,
		]
	)

	const handleRemoveBreed = useCallback(
		(breedUuid: string) => {
			setModalData({
				open: true,
				title: t('modal.deleteBreed.title'),
				message: t('modal.deleteBreed.message'),
				onAccept: async () => {
					await withLoadingAndError(async () => {
						await BreedsService.deleteBreed(breedUuid)
						setBreeds((prev) => prev.filter((breed) => breed.uuid !== breedUuid))
						setDbBreeds(breeds)
						setModalData(defaultModalData)
						showToast(t('toast.deletedBreed'), 'success')
					}, t('toast.errorDeletingBreed'))
				},
				onCancel: () => {
					setModalData(defaultModalData)
					showToast(t('toast.notDeletedBreed'), 'info')
				},
			})
		},
		[breeds, setModalData, defaultModalData, withLoadingAndError, showToast, t, setDbBreeds]
	)

	const handleSpeciesSubmit = useCallback(
		async (speciesData: Species, breedData: Breed[]) => {
			await withLoadingAndError(async () => {
				// Update species
				await SpeciesService.upsertSpecies(speciesData)

				// Update breeds for this species
				for (const breed of breedData) {
					await BreedsService.upsertBreed(breed)
				}

				// Update local state
				setSpecies((prev) =>
					prev.map((sp) =>
						sp.uuid === speciesData.uuid ? { ...sp, ...speciesData, editable: false } : sp
					)
				)

				// Update store
				const updatedSpecies = species.map((sp) =>
					sp.uuid === speciesData.uuid ? { ...sp, ...speciesData, editable: false } : sp
				)
				setDbSpecies(updatedSpecies)
				setDbBreeds(breeds)

				showToast(t('toast.edited'), 'success')
			}, t('toast.errorEditing'))
		},
		[species, breeds, withLoadingAndError, setDbSpecies, setDbBreeds, showToast, t]
	)

	useEffect(() => {
		if (!farm) return
		const sps = dbSpecies.map((specie) => ({
			...specie,
			editable: false,
		}))
		setBreeds(dbBreeds)
		setSpecies(sps)
	}, [farm, dbBreeds, dbSpecies])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-y-auto">
			<div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				{/* Hero Header */}
				<div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 sm:mb-8">
					<div className="bg-gradient-to-r from-blue-600 to-green-600 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex items-center gap-3 sm:gap-4">
								<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
									<i className="i-material-symbols-category bg-white! w-6! h-6! sm:w-8 sm:h-8" />
								</div>
								<div className="min-w-0">
									<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
										{t('title')}
									</h1>
									<p className="text-blue-100 text-sm sm:text-base mt-1">{t('subtitle')}</p>
								</div>
							</div>

							{/* Stats Cards */}
							<div className="flex gap-2 sm:gap-4">
								<div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
									<div className="text-lg sm:text-xl font-bold text-white">{species.length}</div>
									<div className="text-xs text-blue-100">{t('totalSpecies')}</div>
								</div>
								<div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
									<div className="text-lg sm:text-xl font-bold text-white">{breeds.length}</div>
									<div className="text-xs text-blue-100">{t('totalBreeds')}</div>
								</div>
							</div>
						</div>
					</div>

					{/* Actions Bar */}
					<div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
						<div className="flex items-center justify-between gap-4">
							<div className="flex-1 max-w-md">
								<Search placeholder={t('search')} />
							</div>

							<div className="flex-shrink-0">
								<Button
									title={t('addMoreSpecies')}
									onClick={handleAddSpecie}
									className="btn btn-primary h-12 text-base sm:text-lg px-6 sm:px-8"
								>
									<i className="i-material-symbols-add-circle-outline w-5! h-5! mr-2" />
									{t('addMoreSpecies')}
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Species Grid */}
				{species.length > 0 ? (
					<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
						{/* Species Cards Grid */}
						<div className="p-4 sm:p-6">
							<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
								{species.map((specie) => (
									<SpeciesFormCard
										key={specie.uuid}
										specie={specie}
										breeds={breeds}
										onSpecieChange={handleSpecieChange}
										onBreedChange={handleBreedChange}
										onAddBreed={handleAddBreed}
										onRemoveBreed={handleRemoveBreed}
										onEdit={handleEdit}
										onRemove={handleRemoveSpecie}
										onSubmit={handleSpeciesSubmit}
									/>
								))}
							</div>
						</div>
					</div>
				) : (
					/* Empty State */
					<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
						<div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
							<div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
								<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center">
									<i className="i-material-symbols-category w-8! h-8! sm:w-10 sm:h-10 bg-gray-400!" />
								</div>
								<div className="space-y-2">
									<h3 className="text-xl sm:text-2xl font-bold text-gray-900">{t('noSpecies')}</h3>
									<p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
										{t('noSpeciesSubtitle')}
									</p>
								</div>
								<Button
									title={t('addFirstSpecies')}
									onClick={handleAddSpecie}
									className="btn btn-primary mt-4"
								>
									<i className="i-material-symbols-add-circle-outline w-5! h-5! mr-2" />
									{t('addFirstSpecies')}
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

const INITIAL_SPECIES: MySpeciesI[] = [
	{
		uuid: '',
		farmUuid: '',
		name: '',
		editable: false,
	},
]

const INITIAL_BREEDS: Breed[] = [
	{
		uuid: '',
		speciesUuid: '',
		farmUuid: '',
		name: '',
		gestationPeriod: 0,
	},
]

export default memo(MySpecies)
