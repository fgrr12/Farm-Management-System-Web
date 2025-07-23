import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'

import { BreedsService } from '@/services/breeds'
import { SpeciesService } from '@/services/species'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { TextField } from '@/components/ui/TextField'

import { useBreedForm } from '@/hooks/forms/useBreedForm'
import { useSpeciesForm } from '@/hooks/forms/useSpeciesForm'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { MySpeciesI } from './MySpecies.types'

const BreedFormComponent = memo(
	({
		breed,
		editable,
		onUpdate,
		onRemove,
	}: {
		breed: Breed
		editable: boolean
		onUpdate: (uuid: string, data: any) => void
		onRemove: (uuid: string) => void
	}) => {
		const { t } = useTranslation(['mySpecies'])
		const breedForm = useBreedForm(breed)

		useEffect(() => {
			breedForm.resetWithData(breed)
		}, [breed, breedForm])

		const handleSubmit = useCallback(
			async (data: any) => {
				const transformedData = breedForm.transformToApiFormat(data)
				onUpdate(breed.uuid, transformedData)
			},
			[breedForm, breed.uuid, onUpdate]
		)

		const handleFieldChange = useCallback(
			(field: string, value: any) => {
				const currentData = breedForm.getValues()
				const updatedData = { ...currentData, [field]: value }
				handleSubmit(updatedData)
			},
			[breedForm, handleSubmit]
		)

		return (
			<div className="grid grid-cols-5 items-center gap-4 w-full">
				<div className="col-span-2">
					<TextField
						{...breedForm.register('name')}
						type="text"
						required={editable}
						disabled={!editable}
						placeholder={t('breed')}
						error={breedForm.errors.name?.message}
						onChange={(e) => {
							breedForm.register('name').onChange(e)
							handleFieldChange('name', e.target.value)
						}}
					/>
				</div>
				<div className="col-span-2">
					<TextField
						{...breedForm.register('gestationPeriod', { valueAsNumber: true })}
						type="number"
						onWheel={(e) => e.currentTarget.blur()}
						required={editable}
						disabled={!editable}
						placeholder={t('gestationPeriod')}
						error={breedForm.errors.gestationPeriod?.message}
						onChange={(e) => {
							breedForm.register('gestationPeriod', { valueAsNumber: true }).onChange(e)
							handleFieldChange('gestationPeriod', Number(e.target.value))
						}}
					/>
				</div>
				<ActionButton
					type="button"
					title={t('removeButton')}
					icon="i-material-symbols-delete-outline"
					onClick={() => onRemove(breed.uuid)}
					disabled={!editable}
				/>
			</div>
		)
	}
)

BreedFormComponent.displayName = 'BreedFormComponent'

const SpeciesFormComponent = memo(
	({
		specie,
		breeds,
		onSpecieUpdate,
		onBreedUpdate,
		onAddBreed,
		onRemoveSpecie,
		onRemoveBreed,
		onEdit,
		onSubmit,
	}: {
		specie: MySpeciesI
		breeds: Breed[]
		onSpecieUpdate: (uuid: string, data: any) => void
		onBreedUpdate: (uuid: string, data: any) => void
		onAddBreed: (specieUuid: string) => void
		onRemoveSpecie: (uuid: string) => void
		onRemoveBreed: (uuid: string) => void
		onEdit: (uuid: string) => void
		onSubmit: (specieUuid: string) => void
	}) => {
		const { t } = useTranslation(['mySpecies'])

		const speciesForm = useSpeciesForm(specie)

		const specieBreeds = breeds.filter((breed) => breed.speciesUuid === specie.uuid)

		useEffect(() => {
			speciesForm.resetWithData(specie)
		}, [specie, speciesForm])

		const handleSpeciesSubmit = useCallback(
			async (data: any) => {
				const transformedData = speciesForm.transformToApiFormat(data)
				onSpecieUpdate(specie.uuid, transformedData)
				onSubmit(specie.uuid)
			},
			[speciesForm, specie.uuid, onSpecieUpdate, onSubmit]
		)

		const handleSpeciesFieldChange = useCallback(
			(field: string, value: any) => {
				const currentData = speciesForm.getValues()
				const updatedData = { ...currentData, [field]: value }
				const transformedData = speciesForm.transformToApiFormat(updatedData)
				onSpecieUpdate(specie.uuid, transformedData)
			},
			[speciesForm, specie.uuid, onSpecieUpdate]
		)

		return (
			<div className="flex flex-col w-full gap-4 p-4 border-2 rounded-xl border-gray-300">
				<header className="flex flex-row justify-between items-center">
					<div className="text-xl font-bold">
						<form
							onSubmit={speciesForm.handleSubmit(handleSpeciesSubmit)}
							noValidate
							autoComplete="off"
						>
							<TextField
								{...speciesForm.register('name')}
								type="text"
								required={specie.editable}
								disabled={!specie.editable}
								placeholder={t('speciesName')}
								error={speciesForm.errors.name?.message}
								onChange={(e) => {
									speciesForm.register('name').onChange(e)
									handleSpeciesFieldChange('name', e.target.value)
								}}
							/>
						</form>
					</div>
					<div className="flex flex-row justify-end items-center mt-4">
						<ActionButton
							type="button"
							title={t('editButton')}
							icon="i-material-symbols-edit-square-outline"
							onClick={() => onEdit(specie.uuid)}
						/>
						<ActionButton
							type="button"
							title={t('deleteButton')}
							icon="i-material-symbols-delete-outline"
							onClick={() => onRemoveSpecie(specie.uuid)}
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
						onClick={() => onAddBreed(specie.uuid)}
						disabled={!specie.editable}
					/>
				</div>

				{specieBreeds.map((breed) => (
					<BreedFormComponent
						key={breed.uuid}
						breed={breed}
						editable={specie.editable}
						onUpdate={onBreedUpdate}
						onRemove={onRemoveBreed}
					/>
				))}

				<Button type="button" disabled={!specie.editable} onClick={() => onSubmit(specie.uuid)}>
					{t('saveButton')}
				</Button>
			</div>
		)
	}
)

SpeciesFormComponent.displayName = 'SpeciesFormComponent'

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

	const handleSpecieUpdate = useCallback((specieUuid: string, data: Species) => {
		setSpecies((prev) => prev.map((sp) => (sp.uuid === specieUuid ? { ...sp, ...data } : sp)))
	}, [])

	const handleBreedUpdate = useCallback((breedUuid: string, data: Breed) => {
		setBreeds((prev) =>
			prev.map((breed) => (breed.uuid === breedUuid ? { ...breed, ...data } : breed))
		)
	}, [])

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

	const handleSubmitSpecie = useCallback(
		async (specieUuid: string) => {
			const specie = species.find((s) => s.uuid === specieUuid)
			if (!specie) return

			// Validate species name
			if (!specie.name.trim()) {
				showToast(t('toast.speciesNameRequired'), 'error')
				return
			}

			// Validate breeds for this species
			const specieBreeds = breeds.filter((b) => b.speciesUuid === specieUuid)
			const hasEmptyBreeds = specieBreeds.some((breed) => !breed.name.trim())
			if (hasEmptyBreeds) {
				showToast(t('toast.breedNameRequired'), 'error')
				return
			}

			await withLoadingAndError(async () => {
				const updatedSpecies = species.map((sp) =>
					sp.uuid === specieUuid ? { ...sp, editable: false } : sp
				)

				await handleUpdateSpeciesAndBreeds(updatedSpecies)
				showToast(t('toast.edited'), 'success')
			}, t('toast.errorEditing'))
		},
		[species, breeds, handleUpdateSpeciesAndBreeds, withLoadingAndError, showToast, t]
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
					<SpeciesFormComponent
						key={specie.uuid}
						specie={specie}
						breeds={breeds}
						onSpecieUpdate={handleSpecieUpdate}
						onBreedUpdate={handleBreedUpdate}
						onAddBreed={handleAddBreed}
						onRemoveSpecie={handleRemoveSpecie}
						onRemoveBreed={handleRemoveBreed}
						onEdit={handleEdit}
						onSubmit={handleSubmitSpecie}
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
