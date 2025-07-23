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
		<div className="flex flex-col w-full h-full p-4 gap-4 overflow-auto">
			<div className="flex flex-col sm:grid sm:grid-cols-3 items-center justify-center gap-4 w-full">
				<Search placeholder={t('search')} />
				<div className="col-start-3 w-full">
					<Button title={t('addMoreSpecies')} onClick={handleAddSpecie}>
						{t('addMoreSpecies')}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4 w-full">
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
