//Styles
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Dropzone } from '@/components/ui/Dropzone'
import { PageHeader } from '@/components/ui/PageHeader'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import firestoreHandler from '@/config/persistence/firestoreHandler'
import storageHandler from '@/config/persistence/storageHandler'
import { DEFAULT_MODAL_DATA, useAppStore } from '@/store/useAppStore'
import { fileToBase64 } from '@/utils/fileToBase64'
import dayjs from 'dayjs'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import * as S from './AddAnimal.styles'
import type { AnimalForm } from './AddAnimal.types'

export const AddAnimal = () => {
	const { setLoading, setModalData } = useAppStore()
	const [animalForm, setAnimalForm] = useState<AnimalForm>(INITIAL_ANIMAL_FORM)

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

	const handleSubmit = async (event: FormEvent) => {
		try {
			setLoading(true)
			event.preventDefault()
			const image = await storageHandler.setPicture(
				`animals/${animalForm.uuid}`,
				animalForm.picture!
			)

			await firestoreHandler.setDocument('animals', animalForm.uuid, {
				animalId: animalForm.animalId,
				species: animalForm.species,
				breed: animalForm.breed,
				gender: animalForm.gender,
				color: animalForm.color,
				weight: animalForm.weight,
				picture: image.metadata.fullPath,
				birthDate: animalForm.birthDate?.format('YYYY-MM-DD'),
				purchaseDate: animalForm.purchaseDate?.format('YYYY-MM-DD'),
			})

			setModalData({
				open: true,
				title: 'Animal Added',
				message: 'The animal was added successfully',
				onAccept: () => setModalData(DEFAULT_MODAL_DATA),
			})
		} catch (error) {
			setModalData({
				open: true,
				title: 'Error',
				message: 'There was an error adding the animal',
				onAccept: () => setModalData(DEFAULT_MODAL_DATA),
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<S.Container>
			<PageHeader>Add Animal</PageHeader>
			<S.Form onSubmit={handleSubmit} autoComplete="off">
				<TextField
					name="animalId"
					type="text"
					placeholder="Animal ID"
					label="Animal ID"
					onChange={handleTextChange}
					required
				/>
				<S.DropzoneContainer>
					<Dropzone className="dropzone" cleanFile={false} onFile={handleFile} />
				</S.DropzoneContainer>
				<Select label="Species" onChange={handleSelectChange}>
					{species.map((species) => (
						<option key={species} value={species}>
							{species}
						</option>
					))}
				</Select>
				<TextField
					name="breed"
					type="text"
					placeholder="Breed"
					label="Breed"
					onChange={handleTextChange}
					required
				/>
				<Select label="Gender" onChange={handleSelectChange}>
					{genders.map((gender) => (
						<option key={gender} value={gender}>
							{gender}
						</option>
					))}
				</Select>
				<TextField
					name="color"
					type="text"
					placeholder="Color"
					label="Color"
					onChange={handleTextChange}
					required
				/>
				<TextField
					name="weight"
					type="text"
					placeholder="Weight"
					label="Weight"
					onChange={handleTextChange}
					required
				/>
				<DatePicker
					label="Birth Date"
					date={dayjs()}
					onDateChange={handleDateChange('birthDate')}
				/>
				<DatePicker
					label="Purchase Date"
					date={dayjs()}
					onDateChange={handleDateChange('purchaseDate')}
				/>
				<Button type="submit">Add Animal</Button>
			</S.Form>
		</S.Container>
	)
}

const species = ['Cow', 'Sheep', 'Goat', 'Chicken']

const genders = ['Male', 'Female']

const INITIAL_ANIMAL_FORM: AnimalForm = {
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
