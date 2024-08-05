import { fileToBase64 } from '@/utils/fileToBase64'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Dropzone } from '@/components/ui/Dropzone'
import { PageHeader } from '@/components/ui/PageHeader'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import { AppRoutes } from '@/config/constants/routes'
import { AnimalsService } from '@/services/animals'
import { useAppStore } from '@/store/useAppStore'

import type { Animal } from './AnimalForm.types'

import * as S from './AnimalForm.styles'

export const AnimalForm = () => {
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation()

	const { defaultModalData, setLoading, setModalData } = useAppStore()
	const [animalForm, setAnimalForm] = useState<Animal>(INITIAL_ANIMAL_FORM)

	const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setAnimalForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setAnimalForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleDateChange = (key: 'birthDate' | 'purchaseDate') => (newDate: dayjs.Dayjs) => {
		setAnimalForm((prev) => ({ ...prev, [key]: newDate.format('YYYY-MM-DD') }))
	}

	const handleFile = async (file: File) => {
		const picture = await fileToBase64(file)

		setAnimalForm((prev) => ({ ...prev, picture: picture.data }))
	}

	const getAnimal = useCallback(async () => {
		try {
			setLoading(true)
			const animalUuid = params.animalUuid as string
			const dbAnimal = await AnimalsService.getAnimal(animalUuid)
			setAnimalForm(dbAnimal)
		} catch (error) {
			setModalData({
				open: true,
				title: 'Error',
				message: 'There was an error getting the animal',
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}, [params.animalUuid, setModalData, defaultModalData, setLoading])

	const handleSubmit = async (event: FormEvent) => {
		try {
			setLoading(true)
			event.preventDefault()

			await AnimalsService.setAnimal(animalForm)

			setModalData({
				open: true,
				title: 'Animal Added',
				message: 'The animal was added successfully',
				onAccept: () => {
					setModalData(defaultModalData)
					navigate(AppRoutes.ANIMALS)
				},
			})
		} catch (error) {
			setModalData({
				open: true,
				title: 'Error',
				message: 'There was an error adding the animal',
				onAccept: () => setModalData(defaultModalData),
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		getAnimal()
	}, [])

	return (
		<S.Container>
			<PageHeader>{t('addAnimal.title')}</PageHeader>
			<S.Form onSubmit={handleSubmit} autoComplete="off">
				<TextField
					name="animalId"
					type="text"
					placeholder={t('addAnimal.animalId')}
					label={t('addAnimal.animalId')}
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
					label={t('addAnimal.species')}
					value={animalForm.species}
					onChange={handleSelectChange}
				>
					{species.map((species) => (
						<option key={species} value={species}>
							{t(`species.${species.toLowerCase()}`)}
						</option>
					))}
				</Select>
				<TextField
					name="breed"
					type="text"
					placeholder={t('addAnimal.breed')}
					label={t('addAnimal.breed')}
					value={animalForm.breed}
					onChange={handleTextChange}
					required
				/>
				<Select
					name="gender"
					label={t('addAnimal.gender')}
					value={animalForm.gender}
					onChange={handleSelectChange}
				>
					{genders.map((gender) => (
						<option key={gender} value={gender}>
							{t(`gender.${gender.toLowerCase()}`)}
						</option>
					))}
				</Select>
				<TextField
					name="color"
					type="text"
					placeholder={t('addAnimal.color')}
					label={t('addAnimal.color')}
					value={animalForm.color}
					onChange={handleTextChange}
					required
				/>
				<TextField
					name="weight"
					type="text"
					placeholder={t('addAnimal.weight')}
					label={t('addAnimal.weight')}
					value={animalForm.weight}
					onChange={handleTextChange}
					required
				/>
				<DatePicker
					label={t('addAnimal.birthDate')}
					date={dayjs(animalForm.birthDate)}
					onDateChange={handleDateChange('birthDate')}
				/>
				<DatePicker
					label={t('addAnimal.purchaseDate')}
					date={dayjs(animalForm.purchaseDate)}
					onDateChange={handleDateChange('purchaseDate')}
				/>
				<Button type="submit">{t('addAnimal.addAnimal')}</Button>
			</S.Form>
		</S.Container>
	)
}

const species: Species[] = ['Cow', 'Sheep', 'Goat', 'Chicken']

const genders: Gender[] = ['Male', 'Female']

const INITIAL_ANIMAL_FORM: Animal = {
	uuid: crypto.randomUUID(),
	animalId: 0,
	species: 'Cow',
	breed: '',
	gender: 'Male',
	color: '',
	weight: 0,
	picture: '',
	birthDate: dayjs(),
	purchaseDate: dayjs(),
}
