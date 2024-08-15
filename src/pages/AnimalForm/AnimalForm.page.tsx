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

import type { Animal } from './AnimalForm.types'

import * as S from './AnimalForm.styles'

export const AnimalForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation()

	const { defaultModalData, setLoading, setModalData, setHeaderTitle } = useAppStore()
	const [animalForm, setAnimalForm] = useState<Animal>(INITIAL_ANIMAL_FORM)
	const [species, setSpecies] = useState<string[]>([])

	const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setAnimalForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setAnimalForm((prev) => ({ ...prev, [name]: value }))
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
					title: 'Animal Edited',
					message: 'The animal was edited successfully',
					onAccept: () => {
						setModalData(defaultModalData)
						navigate(AppRoutes.ANIMAL.replace(':animalUuid', animalUuid))
					},
				})
			} else {
				await AnimalsService.setAnimal(animalForm, user!.uuid, user!.farmUuid)
				setModalData({
					open: true,
					title: 'Animal Added',
					message: 'The animal was added successfully',
					onAccept: () => {
						setModalData(defaultModalData)
						setAnimalForm(INITIAL_ANIMAL_FORM)
					},
				})
			}
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
		setHeaderTitle(t('addAnimal.title'))
		if (user) {
			setSpecies(farm!.species)
			if (params.animalUuid) {
				getAnimal()
			}
		}
	}, [user])

	return (
		<S.Container>
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
					required
				>
					<option value="" disabled>
						{t('addAnimal.species')}
					</option>
					{species.map((species, index) => (
						<option key={index} value={species}>
							{species}
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
					<option value="" disabled>
						{t('addAnimal.gender')}
					</option>
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
					type="number"
					placeholder={`${t('addAnimal.weight')} (${farm?.weightUnit})`}
					label={`${t('addAnimal.weight')} (${farm?.weightUnit})`}
					value={animalForm.weight}
					onChange={handleTextChange}
					onWheel={(e) => e.currentTarget.blur()}
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
				{params.animalUuid && (
					<DatePicker
						label={t('addAnimal.soldDate')}
						date={dayjs(animalForm.soldDate)}
						onDateChange={handleDateChange('soldDate')}
					/>
				)}
				{params.animalUuid && (
					<DatePicker
						label={t('addAnimal.deathDate')}
						date={dayjs(animalForm.deathDate)}
						onDateChange={handleDateChange('deathDate')}
					/>
				)}
				<Button type="submit">{t('addAnimal.addAnimal')}</Button>
			</S.Form>
		</S.Container>
	)
}

const genders: Gender[] = ['Male', 'Female']

const INITIAL_ANIMAL_FORM: Animal = {
	uuid: '',
	animalId: '',
	species: '',
	breed: '',
	gender: 'Male',
	color: '',
	weight: 0,
	picture: '',
	status: true,
	birthDate: dayjs(),
	purchaseDate: dayjs(),
	soldDate: null,
	deathDate: null,
}

const formatDate = (date: dayjs.Dayjs | string) => {
	return dayjs(date).toISOString()
}
