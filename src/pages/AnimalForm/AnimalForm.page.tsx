import dayjs from 'dayjs'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { fileToBase64 } from '@/utils/fileToBase64'
import { formatDate } from '@/utils/formatDate'

import { AnimalsService } from '@/services/animals'

import { DatePicker } from '@/components/layout/DatePicker'
import { Dropzone } from '@/components/layout/Dropzone'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { useAnimalForm } from '@/hooks/forms/useAnimalForm'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { AnimalFormData } from '@/schemas'

const AnimalForm = () => {
	const { user } = useUserStore()
	const { farm, species, breeds } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['animalForm'])

	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const [pictureUrl, setPictureUrl] = useState<string>('')

	const form = useAnimalForm()
	const {
		handleSubmit,
		control,
		watch,
		setValue,
		reset,
		formState: { errors, isSubmitting },
		transformToApiFormat,
		getErrorMessage,
		resetWithData,
		registerCapitalized,
		registerNumber,
		registerTextareaCapitalized,
	} = form

	const watchedSpeciesUuid = watch('speciesUuid')

	const filteredBreeds = useMemo(() => {
		return breeds.filter((breed) => breed.speciesUuid === watchedSpeciesUuid)
	}, [breeds, watchedSpeciesUuid])

	useEffect(() => {
		if (watchedSpeciesUuid) {
			const currentBreedUuid = watch('breedUuid')
			const isValidBreed = filteredBreeds.some((breed) => breed.uuid === currentBreedUuid)
			if (!isValidBreed) {
				setValue('breedUuid', '')
			}
		}
	}, [watchedSpeciesUuid, filteredBreeds, setValue, watch])

	const handleFile = useCallback(
		async (file: File) => {
			const picture = await fileToBase64(file)
			const fullDataUrl = `data:${picture.contentType};base64,${picture.data}`
			setPictureUrl(fullDataUrl)
			setValue('picture', picture.data)
		},
		[setValue]
	)

	const getAnimal = useCallback(async () => {
		await withLoadingAndError(async () => {
			if (!params.animalUuid) return null

			const animalUuid = params.animalUuid as string
			const dbAnimal = await AnimalsService.getAnimal(animalUuid)

			resetWithData(dbAnimal)

			if (dbAnimal.picture) {
				setPictureUrl(`data:image/jpeg;base64,${dbAnimal.picture}`)
			}

			return dbAnimal
		}, t('toast.errorGettingAnimal'))
	}, [params.animalUuid, withLoadingAndError, t, resetWithData])

	const onSubmit = useCallback(
		async (data: AnimalFormData) => {
			if (!user) return

			await withLoadingAndError(async () => {
				const animalUuid = params.animalUuid as string

				const animalData = transformToApiFormat(data)
				animalData.uuid = animalUuid ?? crypto.randomUUID()
				animalData.farmUuid = user.farmUuid

				if (animalData.birthDate) {
					animalData.birthDate = formatDate(animalData.birthDate)
				}
				if (animalData.purchaseDate) {
					animalData.purchaseDate = formatDate(animalData.purchaseDate)
				}
				if (animalData.soldDate) {
					animalData.soldDate = formatDate(animalData.soldDate)
				}
				if (animalData.deathDate) {
					animalData.deathDate = formatDate(animalData.deathDate)
				}

				if (animalUuid) {
					await AnimalsService.updateAnimal(animalData, user.uuid)
					showToast(t('toast.edited'), 'success')
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', animalUuid))
				} else {
					await AnimalsService.setAnimal(animalData, user.uuid, user.farmUuid)
					showToast(t('toast.added'), 'success')
					reset()
					setPictureUrl('')
				}
			}, t('toast.errorAddingAnimal'))
		},
		[
			user,
			params.animalUuid,
			transformToApiFormat,
			withLoadingAndError,
			showToast,
			t,
			navigate,
			reset,
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
				{t('accessibility.skipToForm')}
			</a>

			<form
				id="animal-form"
				className="flex flex-col sm:grid sm:grid-cols-2 items-center gap-4 max-w-[800px] w-full"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
				aria-labelledby="form-heading"
				noValidate
			>
				<h2 id="form-heading" className="sr-only">
					{params.animalUuid ? t('accessibility.editAnimalForm') : t('accessibility.addAnimalForm')}
				</h2>

				<fieldset className="row-span-5 col-start-2 h-full border-0 p-0 m-0">
					<legend className="sr-only">{t('accessibility.animalPhoto')}</legend>
					<Dropzone
						className="dropzone"
						cleanFile={false}
						pictureUrl={pictureUrl}
						onFile={handleFile}
						aria-label={t('accessibility.uploadPhoto')}
						aria-describedby="photo-help"
					/>
					<div id="photo-help" className="sr-only">
						{t('accessibility.photoHelp')}
					</div>
				</fieldset>

				<fieldset className="contents">
					<legend className="sr-only">{t('accessibility.basicInformation')}</legend>

					<TextField
						{...registerCapitalized('animalId')}
						type="text"
						placeholder={t('animalId')}
						label={t('animalId')}
						required
						error={errors.animalId ? getErrorMessage(errors.animalId.message || '') : undefined}
						aria-describedby="animal-id-help"
						autoComplete="off"
					/>
					<div id="animal-id-help" className="sr-only">
						{t('accessibility.animalIdHelp')}
					</div>

					<Controller
						name="speciesUuid"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								legend={t('selectSpecies')}
								defaultLabel={t('selectSpecies')}
								optionValue="uuid"
								optionLabel="name"
								items={species}
								required
								error={
									errors.speciesUuid ? getErrorMessage(errors.speciesUuid.message || '') : undefined
								}
								aria-describedby="species-help"
							/>
						)}
					/>
					<div id="species-help" className="sr-only">
						{t('accessibility.speciesHelp')}
					</div>

					<Controller
						name="breedUuid"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								legend={t('selectBreed')}
								defaultLabel={t('selectBreed')}
								optionValue="uuid"
								optionLabel="name"
								items={filteredBreeds}
								disabled={!filteredBreeds.length}
								required
								error={
									errors.breedUuid ? getErrorMessage(errors.breedUuid.message || '') : undefined
								}
								aria-describedby="breed-help"
							/>
						)}
					/>
					<div id="breed-help" className="sr-only">
						{t('accessibility.breedHelp')}
					</div>

					<Controller
						name="gender"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								legend={t('selectGender')}
								defaultLabel={t('selectGender')}
								optionValue="value"
								optionLabel="name"
								items={[
									{ value: 'Male', name: t('genderList.male') },
									{ value: 'Female', name: t('genderList.female') },
								]}
								required
								error={errors.gender ? getErrorMessage(errors.gender.message || '') : undefined}
								aria-describedby="gender-help"
							/>
						)}
					/>
					<div id="gender-help" className="sr-only">
						{t('accessibility.genderHelp')}
					</div>

					<TextField
						{...registerCapitalized('color')}
						type="text"
						placeholder={t('color')}
						label={t('color')}
						error={errors.color ? getErrorMessage(errors.color.message || '') : undefined}
						aria-describedby="color-help"
						autoComplete="off"
					/>
					<div id="color-help" className="sr-only">
						{t('accessibility.colorHelp')}
					</div>

					<TextField
						{...registerNumber('weight')}
						type="number"
						placeholder={`${t('weight')} (${farm?.weightUnit})`}
						label={`${t('weight')} (${farm?.weightUnit})`}
						onWheel={(e) => e.currentTarget.blur()}
						error={errors.weight ? getErrorMessage(errors.weight.message || '') : undefined}
						aria-describedby="weight-help"
						min="0"
						step="0.1"
					/>
					<div id="weight-help" className="sr-only">
						{t('accessibility.weightHelp', { unit: farm?.weightUnit })}
					</div>
				</fieldset>

				<fieldset className="contents">
					<legend className="sr-only">{t('accessibility.dateInformation')}</legend>

					<Controller
						name="birthDate"
						control={control}
						render={({ field: { onChange, value } }) => (
							<DatePicker
								legend={t('birthDate')}
								label={t('birthDate')}
								date={value ? dayjs(value) : null}
								onDateChange={(newDate) => {
									onChange(newDate ? newDate.format('YYYY-MM-DD') : '')
								}}
								error={
									errors.birthDate ? getErrorMessage(errors.birthDate.message || '') : undefined
								}
								aria-describedby="birth-date-help"
							/>
						)}
					/>
					<div id="birth-date-help" className="sr-only">
						{t('accessibility.birthDateHelp')}
					</div>

					<Controller
						name="purchaseDate"
						control={control}
						render={({ field: { onChange, value } }) => (
							<DatePicker
								legend={t('purchaseDate')}
								label={t('purchaseDate')}
								date={value ? dayjs(value) : null}
								onDateChange={(newDate) => {
									onChange(newDate ? newDate.format('YYYY-MM-DD') : '')
								}}
								error={
									errors.purchaseDate
										? getErrorMessage(errors.purchaseDate.message || '')
										: undefined
								}
								aria-describedby="purchase-date-help"
							/>
						)}
					/>
					<div id="purchase-date-help" className="sr-only">
						{t('accessibility.purchaseDateHelp')}
					</div>

					{params.animalUuid && (
						<>
							<Controller
								name="soldDate"
								control={control}
								render={({ field: { onChange, value } }) => (
									<DatePicker
										legend={t('soldDate')}
										label={t('soldDate')}
										date={value ? dayjs(value) : null}
										onDateChange={(newDate) => {
											onChange(newDate ? newDate.format('YYYY-MM-DD') : '')
										}}
										error={
											errors.soldDate ? getErrorMessage(errors.soldDate.message || '') : undefined
										}
										aria-describedby="sold-date-help"
									/>
								)}
							/>
							<div id="sold-date-help" className="sr-only">
								{t('accessibility.soldDateHelp')}
							</div>
						</>
					)}

					{params.animalUuid && (
						<>
							<Controller
								name="deathDate"
								control={control}
								render={({ field: { onChange, value } }) => (
									<DatePicker
										legend={t('deathDate')}
										label={t('deathDate')}
										date={value ? dayjs(value) : null}
										onDateChange={(newDate) => {
											onChange(newDate ? newDate.format('YYYY-MM-DD') : '')
										}}
										error={
											errors.deathDate ? getErrorMessage(errors.deathDate.message || '') : undefined
										}
										aria-describedby="death-date-help"
									/>
								)}
							/>
							<div id="death-date-help" className="sr-only">
								{t('accessibility.deathDateHelp')}
							</div>
						</>
					)}
				</fieldset>

				<div className="col-span-2 w-full">
					<Textarea
						{...registerTextareaCapitalized('origin')}
						placeholder={t('origin')}
						label={t('origin')}
						error={errors.origin ? getErrorMessage(errors.origin.message || '') : undefined}
						aria-describedby="origin-help"
					/>
					<div id="origin-help" className="sr-only">
						{t('accessibility.originHelp')}
					</div>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					className="btn btn-primary h-12 w-full text-lg col-span-2 disabled:loading"
					aria-describedby="submit-help"
				>
					{isSubmitting
						? t('common:loading')
						: params.animalUuid
							? t('editButton')
							: t('addButton')}
				</button>
				<div id="submit-help" className="sr-only">
					{params.animalUuid ? t('accessibility.editSubmitHelp') : t('accessibility.addSubmitHelp')}
				</div>
			</form>
		</div>
	)
}

export default memo(AnimalForm)
