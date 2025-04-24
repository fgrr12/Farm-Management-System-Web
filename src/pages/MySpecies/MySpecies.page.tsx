import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimalsService } from '@/services/animals'
import { FarmsService } from '@/services/farms'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { TextField } from '@/components/ui/TextField'

import type { MySpeciesI } from './MySpecies.types'

export const MySpecies: FC = () => {
	const { t } = useTranslation(['mySpecies'])
	const { user } = useUserStore()
	const { setFarm, farm } = useFarmStore()
	const { defaultModalData, setModalData, setLoading, setHeaderTitle } = useAppStore()

	const [species, setSpecies] = useState<MySpeciesI[]>(INITIAL_SPECIES)

	const handleSpecieChange = (specieUuid: string) => (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		const sps = species.map((sp) =>
			sp.uuid === specieUuid ? { ...sp, [name]: capitalizeFirstLetter(value) } : sp
		)
		setSpecies(sps)
	}

	const handleBreedChange =
		(specie: MySpeciesI, breedUuid: string) => (event: ChangeEvent<HTMLInputElement>) => {
			const { name, value } = event.target
			const breeds = specie.breeds.map((breed) =>
				breed.uuid === breedUuid ? { ...breed, [name]: capitalizeFirstLetter(value) } : breed
			)
			specie.breeds = breeds
			const sps = species.map((sp) => (sp.uuid === specie.uuid ? specie : sp))
			setSpecies(sps)
		}

	const handleAddSpecie = () => {
		const specie: MySpeciesI = {
			...INITIAL_SPECIES[0],
			uuid: crypto.randomUUID(),
			breeds: [
				{
					...INITIAL_SPECIES[0].breeds[0],
					uuid: crypto.randomUUID(),
				},
			],
		}
		const sps = species.concat(specie)
		setSpecies(sps)
	}

	const handleAddBreed = (specie: MySpeciesI) => () => {
		const breed: Breed = {
			uuid: crypto.randomUUID(),
			name: '',
			gestationPeriod: 0,
		}
		const breeds = specie.breeds.concat(breed)
		specie.breeds = breeds
		const sps = species.map((sp) => (sp.uuid === specie.uuid ? specie : sp))
		setSpecies(sps)
	}

	const handleEdit = (specie: MySpeciesI) => () => {
		const sps = species.map((sp) =>
			sp.uuid === specie.uuid ? { ...specie, editable: !specie.editable } : sp
		)
		setSpecies(sps)
	}

	const handleRemoveSpecie = (specieUuid: string) => () => {
		setModalData({
			open: true,
			title: t('modal.deleteSpecies.title'),
			message: t('modal.deleteSpecies.message'),
			onAccept: async () => {
				const sps = species.filter((specie) => specie.uuid !== specieUuid)
				setSpecies(sps)
				setModalData(defaultModalData)
			},
			onCancel: () => setModalData(defaultModalData),
		})
	}

	const handleRemoveBreed = (specie: MySpeciesI, breedUuid: string) => () => {
		setModalData({
			open: true,
			title: t('modal.deleteBreed.title'),
			message: t('modal.deleteBreed.message'),
			onAccept: async () => {
				const breeds = specie.breeds.filter((breed) => breed.uuid !== breedUuid)
				specie.breeds = breeds
				const sps = species.map((sp) => (sp.uuid === specie.uuid ? specie : sp))
				setSpecies(sps)
				setModalData(defaultModalData)
			},
			onCancel: () => setModalData(defaultModalData),
		})
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		try {
			setLoading(true)
			const data: Species[] = species!.map((specie) => ({
				uuid: specie.uuid,
				name: specie.name,
				breeds: specie.breeds,
				status: specie.status,
			}))
			const sps = farm!.species!.map((specie) => ({
				...specie,
				editable: false,
			}))
			await FarmsService.updateFarm({ ...farm!, species: data })
			setFarm({ ...farm!, species: data })
			setSpecies(sps)
			await AnimalsService.updateAnimalsBySpecie({ farm: farm!, species })
			setModalData({
				open: true,
				title: t('modal.saveSpecies.title'),
				message: t('modal.saveSpecies.message'),
				onAccept: () => {
					setModalData(defaultModalData)
				},
			})
		} catch (error) {
			setModalData({
				open: true,
				title: t('modal.errorEditingSpecies.title'),
				message: t('modal.errorEditingSpecies.message'),
				onAccept: () => setModalData(defaultModalData),
				onCancel: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (!farm) return
		const sps = farm!.species!.map((specie) => ({
			...specie,
			editable: false,
		}))
		setSpecies(sps ?? INITIAL_SPECIES)
	}, [farm])

	useEffect(() => {
		setHeaderTitle(t('title'))
	}, [setHeaderTitle, t])
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
						{specie.breeds.map((breed) => (
							<div className="grid grid-cols-5 items-center gap-4 w-full" key={breed.uuid}>
								<div className="col-span-2">
									<TextField
										name="name"
										type="text"
										value={breed.name}
										onChange={handleBreedChange(specie, breed.uuid)}
										required={specie.editable}
										disabled={!specie.editable}
									/>
								</div>
								<div className="col-span-2">
									<TextField
										name="gestationPeriod"
										type="number"
										value={breed.gestationPeriod}
										onChange={handleBreedChange(specie, breed.uuid)}
										onWheel={(e) => e.currentTarget.blur()}
										required={specie.editable}
										disabled={!specie.editable}
									/>
								</div>
								<ActionButton
									type="button"
									title={t('removeButton')}
									icon="i-material-symbols-delete-outline"
									onClick={handleRemoveBreed(specie, breed.uuid)}
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
		uuid: crypto.randomUUID(),
		name: '',
		breeds: [
			{
				uuid: crypto.randomUUID(),
				name: '',
				gestationPeriod: 0,
			},
		],
		status: true,
		editable: false,
	},
]
