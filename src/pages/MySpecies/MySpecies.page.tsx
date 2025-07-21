import { type ChangeEvent, type FormEvent, memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'

import { BreedsService } from '@/services/breeds'
import { SpeciesService } from '@/services/species'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { TextField } from '@/components/ui/TextField'

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
		(specieUuid: string) => (event: ChangeEvent<HTMLInputElement>) => {
			const { name, value } = event.target
			const sps = species.map((sp) =>
				sp.uuid === specieUuid ? { ...sp, [name]: capitalizeFirstLetter(value) } : sp
			)
			setSpecies(sps)
		},
		[species]
	)

	const handleBreedChange = (breedUuid: string) => (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setBreeds((prev) =>
			prev.map((breed) =>
				breed.uuid === breedUuid ? { ...breed, [name]: capitalizeFirstLetter(value) } : breed
			)
		)
	}

	const handleAddSpecie = useCallback(() => {
		if (!farm?.uuid) return

		const specie: MySpeciesI = {
			uuid: crypto.randomUUID(),
			farmUuid: farm.uuid,
			name: '',
			editable: true,
		}
		const sps = species.concat(specie)
		setSpecies(sps)
	}, [farm?.uuid, species])

	const handleAddBreed = (specie: MySpeciesI) => () => {
		const breed: Breed = {
			uuid: crypto.randomUUID(),
			speciesUuid: specie.uuid,
			farmUuid: farm!.uuid,
			name: '',
			gestationPeriod: 0,
		}
		setBreeds((prev) => [...prev, breed])
	}

	const handleEdit = (specie: MySpeciesI) => () => {
		const sps = species.map((sp) =>
			sp.uuid === specie.uuid ? { ...specie, editable: !specie.editable } : sp
		)
		setSpecies(sps)
	}

	const handleUpdateSpeciesAndBreeds = useCallback(
		async (sps: MySpeciesI[]) => {
			if (!farm?.uuid) return

			for (const specie of sps) {
				await SpeciesService.upsertSpecies({
					uuid: specie.uuid,
					farmUuid: farm.uuid,
					name: specie.name,
				})

				for (const breed of breeds) {
					if (breed.speciesUuid === specie.uuid) {
						await BreedsService.upsertBreed({
							...breed,
							speciesUuid: specie.uuid,
						})
					}
				}
			}

			setDbSpecies(sps)
			setDbBreeds(breeds)
			setSpecies(sps)
		},
		[farm?.uuid, breeds, setDbSpecies, setDbBreeds]
	)

	const handleRemoveSpecie = useCallback(
		(specieUuid: string) => () => {
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
		(breedUuid: string) => () => {
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

	const handleSubmit = useCallback(
		async (e: FormEvent) => {
			e.preventDefault()

			await withLoadingAndError(async () => {
				const updatedSpecies = species.map((specie) => ({
					...specie,
					editable: false,
				}))

				await handleUpdateSpeciesAndBreeds(updatedSpecies)
				showToast(t('toast.edited'), 'success')
			}, t('toast.errorEditing'))
		},
		[species, handleUpdateSpeciesAndBreeds, withLoadingAndError, showToast, t]
	)

	useEffect(() => {
		if (!farm) return
		const sps = dbSpecies.map((specie) => ({
			...specie,
			editable: false,
		}))
		setBreeds(dbBreeds)
		setSpecies(sps)
	}, [farm, dbBreeds, dbSpecies.map])

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
			<form
				className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4 w-full"
				autoComplete="off"
				onSubmit={handleSubmit}
			>
				{species.map((specie) => (
					<div
						key={specie.uuid}
						className="flex flex-col w-full gap-4 p-4 border-2 rounded-xl border-gray-300"
					>
						<header className="flex flex-row justify-between items-center">
							<div className="text-xl font-bold">
								<TextField
									name="name"
									type="text"
									value={specie.name}
									onChange={handleSpecieChange(specie.uuid)}
									required={specie.editable}
									disabled={!specie.editable}
								/>
							</div>
							<div className="flex flex-row justify-end items-center mt-4">
								<ActionButton
									type="button"
									title={t('editButton')}
									icon="i-material-symbols-edit-square-outline"
									onClick={handleEdit(specie)}
								/>
								<ActionButton
									type="button"
									title={t('deleteButton')}
									icon="i-material-symbols-delete-outline"
									onClick={handleRemoveSpecie(specie.uuid)}
								/>
							</div>
						</header>
						<div className="grid grid-cols-5 items-center gap-4 w-full">
							<h3 className="font-semibold text-center col-span-2">{t('breed')}</h3>
							<h3 className="font-semibold text-center col-span-2">{t('gestationPeriod')}</h3>
							<ActionButton
								type="button"
								title={t('addButton')}
								icon="i-material-symbols-add-circle-outline"
								onClick={handleAddBreed(specie)}
								disabled={!specie.editable}
							/>
						</div>
						{breeds
							.filter((breed) => breed.speciesUuid === specie.uuid)
							.map((breed) => (
								<div className="grid grid-cols-5 items-center gap-4 w-full" key={breed.uuid}>
									<div className="col-span-2">
										<TextField
											name="name"
											type="text"
											value={breed.name}
											onChange={handleBreedChange(breed.uuid)}
											required={specie.editable}
											disabled={!specie.editable}
										/>
									</div>
									<div className="col-span-2">
										<TextField
											name="gestationPeriod"
											type="number"
											value={breed.gestationPeriod}
											onChange={handleBreedChange(breed.uuid)}
											onWheel={(e) => e.currentTarget.blur()}
											required={specie.editable}
											disabled={!specie.editable}
										/>
									</div>
									<ActionButton
										type="button"
										title={t('removeButton')}
										icon="i-material-symbols-delete-outline"
										onClick={handleRemoveBreed(breed.uuid)}
										disabled={!specie.editable}
									/>
								</div>
							))}
						<Button type="submit" disabled={!specie.editable}>
							{t('saveButton')}
						</Button>
					</div>
				))}
			</form>
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
