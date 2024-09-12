import { fileToBase64 } from '@/utils/fileToBase64'
import dayjs from 'dayjs'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Dropzone } from '@/components/ui/Dropzone'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import { AppRoutes } from '@/config/constants/routes'
import { AnimalsService } from '@/services/animals'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import * as S from './AnimalForm.styles'

export const AnimalForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['animalForm'])

	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()
	const [animalForm, setAnimalForm] = useState<Animal>(INITIAL_ANIMAL_FORM)
	const [species, setSpecies] = useState(INITIAL_SPECIES)
	const [breeds, setBreeds] = useState<Breed[]>([])

	const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setAnimalForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		if (name === 'species') {
			const species = farm!.species!.find((sp) => sp.uuid === value)
			setAnimalForm((prev) => ({ ...prev, species: { uuid: value, name: species!.name! } }))
			setBreeds(species!.breeds)
		} else if (name === 'breed') {
			const breed = breeds.find((breed) => breed.uuid === value)
			setAnimalForm((prev) => ({
				...prev,
				breed: { uuid: value, name: breed!.name!, gestationPeriod: 0 },
			}))
		}
	}

	const handleDateChange =
		(key: 'birthDate' | 'purchaseDate' | 'soldDate' | 'deathDate') => (newDate: dayjs.Dayjs) => {
			setAnimalForm((prev) => ({ ...prev, [key]: newDate.format('YYYY-MM-DD') }))
		}

	const handleFile = async (file: File) => {
		const picture = await fileToBase64(file)
		setAnimalForm((prev) => ({ ...prev, picture: picture.data }))
	}

	const getAnimal = async () => {
		try {
			setLoading(true)
			const animalUuid = params.animalUuid as string
			const dbAnimal = await AnimalsService.getAnimal(animalUuid)
			const species = farm!.species!.find((sp) => sp.uuid === dbAnimal.species.uuid)
			setAnimalForm(dbAnimal)
			setBreeds(species!.breeds)
		} catch (error) {
			setModalData({
				open: true,
				title: t('modal.errorGettingAnimal.title'),
				message: t('modal.errorGettingAnimal.message'),
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (event: FormEvent) => {
		try {
			setLoading(true)
			event.preventDefault()
			const animalUuid = params.animalUuid as string
			animalForm.uuid = animalUuid ?? crypto.randomUUID()

			if (animalForm.birthDate) {
				animalForm.birthDate = formatDate(animalForm.birthDate)
			}

			if (animalForm.purchaseDate) {
				animalForm.purchaseDate = formatDate(animalForm.purchaseDate)
			}

			if (animalForm.soldDate) {
				animalForm.soldDate = formatDate(animalForm.soldDate)
			}

			if (animalForm.deathDate) {
				animalForm.deathDate = formatDate(animalForm.deathDate)
			}

			if (animalUuid) {
				await AnimalsService.updateAnimal(animalForm, user!.uuid)
				setModalData({
					open: true,
					title: t('modal.editAnimal.title'),
					message: t('modal.editAnimal.message'),
					onAccept: () => {
						setModalData(defaultModalData)
						navigate(AppRoutes.ANIMAL.replace(':animalUuid', animalUuid))
					},
				})
			} else {
				await AnimalsService.setAnimal(animalForm, user!.uuid, user!.farmUuid)
				setModalData({
					open: true,
					title: t('modal.addAnimal.title'),
					message: t('modal.addAnimal.message'),
					onAccept: () => {
						setModalData(defaultModalData)
						setAnimalForm(INITIAL_ANIMAL_FORM)
					},
				})
			}
		} catch (error) {
			setModalData({
				open: true,
				title: t('modal.errorAddingAnimal.title'),
				message: t('modal.errorAddingAnimal.message'),
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		if (!user) return
		setSpecies(farm!.species!)
		if (params.animalUuid) getAnimal()
	}, [user])

	useEffect(() => {
		const title = params.animalUuid ? t('editAnimal') : t('addAnimal')
		setHeaderTitle(title)
	}, [setHeaderTitle, t, params.animalUuid])

	return (
		<S.Container>
			<S.Form onSubmit={handleSubmit} autoComplete="off">
				<TextField
					name="animalId"
					type="text"
					placeholder={t('animalId')}
					label={t('animalId')}
					value={animalForm.animalId}
					onChange={handleTextChange}
					required
				/>
				<S.DropzoneContainer>
					<Dropzone
						className="dropzone"
						cleanFile={false}
						pictureUrl={animalForm.picture}
						onFile={handleFile}
					/>
				</S.DropzoneContainer>
				<Select
					name="species"
					label={t('species')}
					defaultLabel={t('selectSpecies')}
					optionValue="uuid"
					optionLabel="name"
					value={animalForm.species.uuid}
					items={species}
					onChange={handleSelectChange}
					required
				/>
				<Select
					name="breed"
					label={t('breed')}
					defaultLabel={t('selectBreed')}
					optionValue="uuid"
					optionLabel="name"
					value={animalForm.breed.uuid}
					items={breeds}
					onChange={handleSelectChange}
					disabled={!breeds.length}
					required
				/>
				<Select
					name="gender"
					label={t('gender')}
					defaultLabel={t('selectGender')}
					value={animalForm.gender}
					items={[
						{ value: 'Male', name: t('genderList.male') },
						{ value: 'Female', name: t('genderList.female') },
					]}
					onChange={handleSelectChange}
					required
				/>
				<TextField
					name="color"
					type="text"
					placeholder={t('color')}
					label={t('color')}
					value={animalForm.color}
					onChange={handleTextChange}
					required
				/>
				<TextField
					name="weight"
					type="number"
					placeholder={`${t('weight')} (${farm?.weightUnit})`}
					label={`${t('weight')} (${farm?.weightUnit})`}
					value={animalForm.weight}
					onChange={handleTextChange}
					onWheel={(e) => e.currentTarget.blur()}
					required
				/>
				<DatePicker
					label={t('birthDate')}
					date={dayjs(animalForm.birthDate)}
					onDateChange={handleDateChange('birthDate')}
				/>
				<DatePicker
					label={t('purchaseDate')}
					date={dayjs(animalForm.purchaseDate)}
					onDateChange={handleDateChange('purchaseDate')}
				/>
				{params.animalUuid && (
					<DatePicker
						label={t('soldDate')}
						date={animalForm.soldDate ? dayjs(animalForm.soldDate) : null}
						onDateChange={handleDateChange('soldDate')}
					/>
				)}
				{params.animalUuid && (
					<DatePicker
						label={t('deathDate')}
						date={animalForm.deathDate ? dayjs(animalForm.deathDate) : null}
						onDateChange={handleDateChange('deathDate')}
					/>
				)}
				<Button type="submit">{params.animalUuid ? t('editButton') : t('addButton')}</Button>
			</S.Form>
		</S.Container>
	)
}

const INITIAL_ANIMAL_FORM: Animal = {
	uuid: '',
	animalId: '',
	species: {
		uuid: '',
		name: '',
	},
	breed: {
		uuid: '',
		name: '',
		gestationPeriod: 0,
	},
	gender: '',
	color: '',
	weight: 0,
	picture: '',
	status: true,
	farmUuid: '',
	birthDate: dayjs().toISOString(),
	purchaseDate: dayjs().toISOString(),
	soldDate: null,
	deathDate: null,
}

const INITIAL_SPECIES: Species[] = [
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
	},
]

const formatDate = (date: dayjs.Dayjs | string) => {
	return dayjs(date).toISOString()
}
