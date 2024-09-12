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

import * as S from './MySpecies.styles'

export const MySpecies: FC = () => {
	const { t } = useTranslation(['mySpecies'])
	const { user } = useUserStore()
	const { setFarm, farm } = useFarmStore()
	const { defaultModalData, setModalData, setLoading, setHeaderTitle } = useAppStore()

	const [species, setSpecies] = useState<MySpeciesI[]>(INITIAL_SPECIES)

	const handleSpecieChange = (specieUuid: string) => (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		const sps = species.map((sp) => (sp.uuid === specieUuid ? { ...sp, [name]: value } : sp))
		setSpecies(sps)
	}

	const handleBreedChange =
		(specie: MySpeciesI, breedUuid: string) => (event: ChangeEvent<HTMLInputElement>) => {
			const { name, value } = event.target
			const breeds = specie.breeds.map((breed) =>
				breed.uuid === breedUuid ? { ...breed, [name]: value } : breed
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
			await FarmsService.updateFarm({ ...farm!, species: data })
			setFarm({ ...farm!, species: data })
			species
				.filter((specie) => specie.editable)
				.forEach(async (specie) => {
					const animals = await AnimalsService.getAnimals({
						speciesUuid: specie.uuid,
						search: '',
						farmUuid: farm!.uuid,
					})
					animals.forEach(async (animal) => {
						const species = {
							uuid: specie.uuid,
							name: specie.name,
						}
						const breed = specie!.breeds.find((breed) => breed.uuid === animal.breed.uuid)
						animal.breed = breed!
						animal.species = species!

						await AnimalsService.updateAnimal(animal, user!.uuid)
					})
				})
			const sps = farm!.species!.map((specie) => ({
				...specie,
				editable: false,
			}))
			setSpecies(sps)
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
		<S.MySpecies>
			<S.Body>
				<S.Title>{t('title')}</S.Title>
				<S.Subtitle>{t('subtitle')}</S.Subtitle>
				<S.SearchContainer>
					<Search placeholder={t('search')} />
					<ActionButton
						type="button"
						title={t('addButton')}
						icon="i-material-symbols-add-circle-outline"
						onClick={handleAddSpecie}
					/>
				</S.SearchContainer>
				<S.Form onSubmit={handleSubmit} autoComplete="off">
					{species.map((specie) => (
						<S.Box key={specie.uuid}>
							<S.BoxHeader>
								<S.Title>
									<TextField
										name="name"
										type="text"
										value={specie.name}
										onChange={handleSpecieChange(specie.uuid)}
										required={specie.editable}
										disabled={!specie.editable}
									/>
								</S.Title>
								<S.BoxActions>
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
								</S.BoxActions>
							</S.BoxHeader>
							<S.DataContainer>
								<S.DataHeader>{t('breed')}</S.DataHeader>
								<S.DataHeader>{t('gestationPeriod')}</S.DataHeader>
								<ActionButton
									type="button"
									title={t('addButton')}
									icon="i-material-symbols-add-circle-outline"
									onClick={handleAddBreed(specie)}
									disabled={!specie.editable}
								/>
							</S.DataContainer>
							<S.DataBody>
								{specie.breeds.map((breed) => (
									<S.DataContainer key={breed.uuid}>
										<TextField
											name="name"
											type="text"
											value={breed.name}
											onChange={handleBreedChange(specie, breed.uuid)}
											required={specie.editable}
											disabled={!specie.editable}
										/>
										<TextField
											name="gestationPeriod"
											type="number"
											value={breed.gestationPeriod}
											onChange={handleBreedChange(specie, breed.uuid)}
											onWheel={(e) => e.currentTarget.blur()}
											required={specie.editable}
											disabled={!specie.editable}
										/>
										<ActionButton
											type="button"
											title={t('removeButton')}
											icon="i-material-symbols-delete-outline"
											onClick={handleRemoveBreed(specie, breed.uuid)}
											disabled={!specie.editable}
										/>
									</S.DataContainer>
								))}
							</S.DataBody>
							<Button type="submit" disabled={!specie.editable}>
								{t('saveButton')}
							</Button>
						</S.Box>
					))}
				</S.Form>
			</S.Body>
		</S.MySpecies>
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
