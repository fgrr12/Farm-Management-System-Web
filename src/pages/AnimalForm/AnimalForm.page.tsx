import dayjs from 'dayjs'
import {
	type ChangeEvent,
	type FormEvent,
	memo,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'
import { fileToBase64 } from '@/utils/fileToBase64'
import { formatDate } from '@/utils/formatDate'

import { AnimalsService } from '@/services/animals'

import { DatePicker } from '@/components/layout/DatePicker'
import { Dropzone } from '@/components/layout/Dropzone'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { usePagePerformance } from '@/hooks/usePagePerformance'

// Custom hook for form state management
const useAnimalForm = (initialForm: Animal) => {
	const [animalForm, setAnimalForm] = useState<Animal>(initialForm)
	const [pictureUrl, setPictureUrl] = useState<string>('')

	const handleTextChange = useCallback(
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value } = event.target
			setAnimalForm((prev) => ({ ...prev, [name]: capitalizeFirstLetter(value) }))
		},
		[]
	)

	const handleSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setAnimalForm((prev) => ({ ...prev, [name]: value }))
	}, [])

	const handleDateChange = useCallback(
		(key: 'birthDate' | 'purchaseDate' | 'soldDate' | 'deathDate') =>
			(newDate: dayjs.Dayjs | null) => {
				setAnimalForm((prev) => ({ ...prev, [key]: newDate ? newDate.format('YYYY-MM-DD') : null }))
			},
		[]
	)

	const handleFile = useCallback(async (file: File) => {
		const picture = await fileToBase64(file)
		const fullDataUrl = `data:${picture.contentType};base64,${picture.data}`
		setPictureUrl(fullDataUrl)
		setAnimalForm((prev) => ({ ...prev, picture: picture.data }))
	}, [])

	return {
		animalForm,
		pictureUrl,
		setAnimalForm,
		handleTextChange,
		handleSelectChange,
		handleDateChange,
		handleFile,
	}
}

const AnimalForm = () => {
	const { user } = useUserStore()
	const { farm, species, breeds } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['animalForm'])

	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()
	const {
		animalForm,
		pictureUrl,
		setAnimalForm,
		handleTextChange,
		handleSelectChange,
		handleDateChange,
		handleFile,
	} = useAnimalForm(INITIAL_ANIMAL_FORM)

	const filteredBreeds = useMemo(() => {
		return breeds.filter((breed) => breed.speciesUuid === animalForm.speciesUuid)
	}, [breeds, animalForm.speciesUuid])

	const getAnimal = useCallback(async () => {
		await withLoadingAndError(async () => {
			if (!params.animalUuid) return null

			const animalUuid = params.animalUuid as string
			const dbAnimal = await AnimalsService.getAnimal(animalUuid)
			setAnimalForm(dbAnimal)
			return dbAnimal
		}, t('toast.errorGettingAnimal'))
	}, [params.animalUuid, withLoadingAndError, t, setAnimalForm])

	const handleSubmit = useCallback(
		async (event: FormEvent) => {
			if (!user) return

			event.preventDefault()

			await withLoadingAndError(async () => {
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
					await AnimalsService.updateAnimal(animalForm, user.uuid)
					showToast(t('toast.edited'), 'success')
					setAnimalForm(INITIAL_ANIMAL_FORM)
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', animalUuid))
				} else {
					await AnimalsService.setAnimal(animalForm, user.uuid, user.farmUuid)
					showToast(t('toast.added'), 'success')
					setAnimalForm(INITIAL_ANIMAL_FORM)
				}
			}, t('toast.errorAddingAnimal'))
		},
		[
			user,
			params.animalUuid,
			animalForm,
			withLoadingAndError,
			showToast,
			t,
			setAnimalForm,
			navigate,
		]
	)

	useEffect(() => {
		if (!user) return
		if (params.animalUuid) {
			getAnimal()
		}
	}, [user, params.animalUuid, getAnimal])

	useEffect(() => {
		const title = params.animalUuid ? t('editAnimal') : t('addAnimal')
		setPageTitle(title)
	}, [setPageTitle, t, params.animalUuid])

	return (
		<div className="flex flex-col justify-center items-center w-full overflow-auto p-5">
			<a
				href="#animal-form"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
			>
				{t('skipToForm', 'Skip to animal form')}
			</a>

			<form
				id="animal-form"
				className="flex flex-col sm:grid sm:grid-cols-2 items-center gap-4 max-w-[800px] w-full"
				onSubmit={handleSubmit}
				autoComplete="off"
				aria-labelledby="form-heading"
				noValidate
			>
				<h2 id="form-heading" className="sr-only">
					{params.animalUuid ? t('editAnimalForm') : t('addAnimalForm')}
				</h2>

				<fieldset className="row-span-5 col-start-2 h-full border-0 p-0 m-0">
					<legend className="sr-only">{t('animalPhoto', 'Animal photo')}</legend>
					<Dropzone
						className="dropzone"
						cleanFile={false}
						pictureUrl={pictureUrl || animalForm.picture}
						onFile={handleFile}
						aria-label={t('uploadPhoto', 'Upload animal photo')}
						aria-describedby="photo-help"
					/>
					<div id="photo-help" className="sr-only">
						{t('photoHelp', 'Click or drag to upload an animal photo')}
					</div>
				</fieldset>

				<fieldset className="contents">
					<legend className="sr-only">{t('basicInformation', 'Basic animal information')}</legend>

					<TextField
						name="animalId"
						type="text"
						placeholder={t('animalId')}
						label={t('animalId')}
						value={animalForm.animalId}
						onChange={handleTextChange}
						required
						aria-describedby="animal-id-help"
						autoComplete="off"
					/>
					<div id="animal-id-help" className="sr-only">
						{t('animalIdHelp', 'Unique identifier for this animal')}
					</div>

					<Select
						name="speciesUuid"
						legend={t('selectSpecies')}
						defaultLabel={t('selectSpecies')}
						optionValue="uuid"
						optionLabel="name"
						value={animalForm.speciesUuid}
						items={species}
						onChange={handleSelectChange}
						required
						aria-describedby="species-help"
					/>
					<div id="species-help" className="sr-only">
						{t('speciesHelp', 'Select the species of this animal')}
					</div>

					<Select
						name="breedUuid"
						legend={t('selectBreed')}
						defaultLabel={t('selectBreed')}
						optionValue="uuid"
						optionLabel="name"
						value={animalForm.breedUuid}
						items={filteredBreeds}
						onChange={handleSelectChange}
						disabled={!filteredBreeds.length}
						required
						aria-describedby="breed-help"
					/>
					<div id="breed-help" className="sr-only">
						{t('breedHelp', 'Select the breed of this animal. First select a species.')}
					</div>

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
						aria-describedby="gender-help"
					/>
					<div id="gender-help" className="sr-only">
						{t('genderHelp', 'Select the gender of this animal')}
					</div>

					<TextField
						name="color"
						type="text"
						placeholder={t('color')}
						label={t('color')}
						value={animalForm.color}
						onChange={handleTextChange}
						required
						aria-describedby="color-help"
						autoComplete="off"
					/>
					<div id="color-help" className="sr-only">
						{t('colorHelp', 'Describe the color or markings of this animal')}
					</div>

					<TextField
						name="weight"
						type="number"
						placeholder={`${t('weight')} (${farm?.weightUnit})`}
						label={`${t('weight')} (${farm?.weightUnit})`}
						value={animalForm.weight}
						onChange={handleTextChange}
						onWheel={(e) => e.currentTarget.blur()}
						required
						aria-describedby="weight-help"
						min="0"
						step="0.1"
					/>
					<div id="weight-help" className="sr-only">
						{t('weightHelp', `Enter the weight of this animal in ${farm?.weightUnit}`)}
					</div>
				</fieldset>

				<fieldset className="contents">
					<legend className="sr-only">{t('dateInformation', 'Date information')}</legend>

					<DatePicker
						legend={t('birthDate')}
						label={t('birthDate')}
						date={dayjs(animalForm.birthDate)}
						onDateChange={handleDateChange('birthDate')}
						aria-describedby="birth-date-help"
					/>
					<div id="birth-date-help" className="sr-only">
						{t('birthDateHelp', 'Select the birth date of this animal')}
					</div>

					<DatePicker
						legend={t('purchaseDate')}
						label={t('purchaseDate')}
						date={dayjs(animalForm.purchaseDate)}
						onDateChange={handleDateChange('purchaseDate')}
						aria-describedby="purchase-date-help"
					/>
					<div id="purchase-date-help" className="sr-only">
						{t('purchaseDateHelp', 'Select when this animal was purchased (optional)')}
					</div>

					{params.animalUuid && (
						<>
							<DatePicker
								legend={t('soldDate')}
								label={t('soldDate')}
								date={animalForm.soldDate ? dayjs(animalForm.soldDate) : null}
								onDateChange={handleDateChange('soldDate')}
								aria-describedby="sold-date-help"
							/>
							<div id="sold-date-help" className="sr-only">
								{t('soldDateHelp', 'Select when this animal was sold (optional)')}
							</div>
						</>
					)}

					{params.animalUuid && (
						<>
							<DatePicker
								legend={t('deathDate')}
								label={t('deathDate')}
								date={animalForm.deathDate ? dayjs(animalForm.deathDate) : null}
								onDateChange={handleDateChange('deathDate')}
								aria-describedby="death-date-help"
							/>
							<div id="death-date-help" className="sr-only">
								{t('deathDateHelp', 'Select the death date if this animal has died (optional)')}
							</div>
						</>
					)}
				</fieldset>

				<div className="col-span-2 w-full">
					<Textarea
						name="origin"
						placeholder={t('origin')}
						label={t('origin')}
						value={animalForm.origin}
						onChange={handleTextChange}
						aria-describedby="origin-help"
					/>
					<div id="origin-help" className="sr-only">
						{t('originHelp', 'Describe the origin or source of this animal (optional)')}
					</div>
				</div>

				<button
					type="submit"
					className="btn btn-primary h-12 w-full text-lg col-span-2"
					aria-describedby="submit-help"
				>
					{params.animalUuid ? t('editButton') : t('addButton')}
				</button>
				<div id="submit-help" className="sr-only">
					{params.animalUuid
						? t('editSubmitHelp', 'Save changes to this animal')
						: t('addSubmitHelp', 'Add this new animal to your farm')}
				</div>
			</form>
		</div>
	)
}

const INITIAL_ANIMAL_FORM: Animal = {
	uuid: '',
	speciesUuid: '',
	breedUuid: '',
	farmUuid: '',
	animalId: '',
	gender: '',
	color: '',
	weight: 0,
	picture: '',
	status: true,
	origin: '',
	birthDate: dayjs().toISOString(),
	purchaseDate: null,
	soldDate: null,
	deathDate: null,
}

export default memo(AnimalForm)
