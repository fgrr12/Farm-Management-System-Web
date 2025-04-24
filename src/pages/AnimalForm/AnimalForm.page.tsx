import { fileToBase64 } from '@/utils/fileToBase64'
import dayjs from 'dayjs'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Dropzone } from '@/components/layout/Dropzone'
import { DatePicker } from '@/components/ui/DatePicker'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import { Textarea } from '@/components/ui/Textarea'
import { AppRoutes } from '@/config/constants/routes'
import { AnimalsService } from '@/services/animals'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

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

	const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.target
		setAnimalForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		if (name === 'species') {
			if (value === '') {
				setAnimalForm((prev) => ({ ...prev, species: { uuid: '', name: '' } }))
				setBreeds([])
				return
			}
			const species = farm!.species!.find((sp) => sp.uuid === value)
			setAnimalForm((prev) => ({ ...prev, species: { uuid: value, name: species!.name! } }))
			setBreeds(species!.breeds)
		} else if (name === 'breed') {
			if (value === '') {
				setAnimalForm((prev) => ({ ...prev, breed: { uuid: '', name: '', gestationPeriod: 0 } }))
				return
			}
			const breed = breeds.find((breed) => breed.uuid === value)
			setAnimalForm((prev) => ({
				...prev,
				breed: { uuid: value, name: breed!.name!, gestationPeriod: breed!.gestationPeriod },
			}))
		} else if (name === 'gender') {
			setAnimalForm((prev) => ({ ...prev, gender: value as Gender }))
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
		<div className="flex flex-col justify-center items-center w-full overflow-auto p-5">
			<form
				className="flex flex-col sm:grid sm:grid-cols-2 items-center gap-4 max-w-[800px] w-full"
				onSubmit={handleSubmit}
				autoComplete="off"
			>
				<div className="row-span-5 col-start-2 h-full">
					<Dropzone
						className="dropzone"
						cleanFile={false}
						pictureUrl={animalForm.picture}
						onFile={handleFile}
					/>
				</div>
				<TextField
					name="animalId"
					type="text"
					placeholder={t('animalId')}
					label={t('animalId')}
					value={animalForm.animalId}
					onChange={handleTextChange}
					required
				/>

				<Select
					name="species"
					legend={t('selectSpecies')}
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
					legend={t('selectBreed')}
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
					legend={t('selectGender')}
					defaultLabel={t('selectGender')}
					optionValue="value"
					optionLabel="name"
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
					legend={t('birthDate')}
					label={t('birthDate')}
					date={dayjs(animalForm.birthDate)}
					onDateChange={handleDateChange('birthDate')}
				/>
				<DatePicker
					legend={t('purchaseDate')}
					label={t('purchaseDate')}
					date={dayjs(animalForm.purchaseDate)}
					onDateChange={handleDateChange('purchaseDate')}
				/>
				{params.animalUuid && (
					<DatePicker
						legend={t('soldDate')}
						label={t('soldDate')}
						date={animalForm.soldDate ? dayjs(animalForm.soldDate) : null}
						onDateChange={handleDateChange('soldDate')}
					/>
				)}
				{params.animalUuid && (
					<DatePicker
						legend={t('deathDate')}
						label={t('deathDate')}
						date={animalForm.deathDate ? dayjs(animalForm.deathDate) : null}
						onDateChange={handleDateChange('deathDate')}
					/>
				)}
				<div className="col-span-2">
					<Textarea
						name="origin"
						placeholder={t('origin')}
						label={t('origin')}
						value={animalForm.origin}
						onChange={handleTextChange}
					/>
				</div>
				<button type="submit" className="btn btn-primary h-12 w-full text-lg col-span-2">
					{params.animalUuid ? t('editButton') : t('addButton')}
				</button>
			</form>
		</div>
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
	origin: '',
	birthDate: dayjs().toISOString(),
	purchaseDate: null,
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
