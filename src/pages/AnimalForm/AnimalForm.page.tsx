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
import { Button } from '@/components/ui/Button'
import type { CustomSelectOption } from '@/components/ui/CustomSelect'
import { CustomSelect } from '@/components/ui/CustomSelect'
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
		register,
		formState: { errors, isSubmitting },
		transformToApiFormat,
		getErrorMessage,
		resetWithData,
	} = form

	const watchedSpeciesUuid = watch('speciesUuid')

	const filteredBreeds = useMemo(() => {
		return breeds.filter((breed) => breed.speciesUuid === watchedSpeciesUuid)
	}, [breeds, watchedSpeciesUuid])

	const speciesOptions: CustomSelectOption[] = useMemo(
		() => species.map((s) => ({ value: s.uuid, label: s.name })),
		[species]
	)

	const breedOptions: CustomSelectOption[] = useMemo(
		() => filteredBreeds.map((b) => ({ value: b.uuid, label: b.name })),
		[filteredBreeds]
	)

	const genderOptions: CustomSelectOption[] = useMemo(
		() => [
			{ value: 'Male', label: t('genderList.male') },
			{ value: 'Female', label: t('genderList.female') },
		],
		[t]
	)

	const healthStatusOptions: CustomSelectOption[] = useMemo(
		() => [
			{ value: 'healthy', label: t('healthStatusOptions.healthy') },
			{ value: 'sick', label: t('healthStatusOptions.sick') },
			{ value: 'treatment', label: t('healthStatusOptions.treatment') },
			{ value: 'critical', label: t('healthStatusOptions.critical') },
			{ value: 'unknown', label: t('healthStatusOptions.unknown') },
		],
		[t]
	)

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
			if (!user || !farm) return

			await withLoadingAndError(async () => {
				const animalUuid = params.animalUuid as string

				const animalData = transformToApiFormat(data)
				animalData.uuid = animalUuid ?? crypto.randomUUID()
				animalData.farmUuid = farm.uuid

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
					await AnimalsService.setAnimal(animalData, user.uuid, farm.uuid)
					showToast(t('toast.added'), 'success')
					reset()
					setPictureUrl('')
				}
			}, t('toast.errorAddingAnimal'))
		},
		[
			user,
			farm,
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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto transition-colors duration-300">
			<div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				<a
					href="#animal-form"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white p-2 rounded z-50 transition-colors duration-200"
				>
					{t('accessibility.skipToForm')}
				</a>

				{/* Hero Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300">
					<div className="bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-700 dark:to-green-700 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 dark:bg-white/30 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg dark:shadow-black/20 backdrop-blur-sm">
								<i className="i-material-symbols-pets bg-white! w-6! h-6! sm:w-8 sm:h-8 drop-shadow-sm" />
							</div>
							<div className="min-w-0">
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-sm">
									{params.animalUuid ? t('editAnimal') : t('addAnimal')}
								</h1>
								<p className="text-blue-100 dark:text-blue-200 text-sm sm:text-base mt-1 drop-shadow-sm">
									{params.animalUuid ? t('editSubtitle') : t('addSubtitle')}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Form Container */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300">
					<form
						id="animal-form"
						className="p-4 sm:p-6 lg:p-8"
						onSubmit={handleSubmit(onSubmit)}
						autoComplete="off"
						aria-labelledby="form-heading"
						noValidate
					>
						<h2 id="form-heading" className="sr-only">
							{params.animalUuid
								? t('accessibility.editAnimalForm')
								: t('accessibility.addAnimalForm')}
						</h2>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
							{/* Photo Section */}
							<div className="lg:col-span-1">
								<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 h-full border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
										<i className="i-material-symbols-photo-camera w-5! h-5! bg-blue-600! dark:bg-blue-500!" />
										{t('animalPhoto')}
									</h3>
									<fieldset className="border-0 p-0 m-0">
										<legend className="sr-only">{t('accessibility.animalPhoto')}</legend>
										<Dropzone
											className="dropzone w-full h-64 sm:h-80 transition-all duration-300"
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
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center transition-colors duration-300">
										{t('photoHint')}
									</p>
								</div>
							</div>

							{/* Basic Information Section */}
							<div className="lg:col-span-2">
								<div className="space-y-6">
									{/* Basic Info Card */}
									<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20">
										<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
											<i className="i-material-symbols-info w-5! h-5! bg-blue-600! dark:bg-blue-500!" />
											{t('basicInformation')}
										</h3>
										<fieldset className="border-0 p-0 m-0">
											<legend className="sr-only">{t('accessibility.basicInformation')}</legend>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												<TextField
													{...register('animalId')}
													type="text"
													placeholder={t('placeholders.animalId')}
													label={t('animalId')}
													required
													error={
														errors.animalId
															? getErrorMessage(errors.animalId.message || '')
															: undefined
													}
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
														<CustomSelect
															label={t('selectSpecies')}
															placeholder={t('placeholders.speciesHint')}
															value={field.value}
															onChange={field.onChange}
															options={speciesOptions}
															required
															error={
																errors.speciesUuid
																	? getErrorMessage(errors.speciesUuid.message || '')
																	: undefined
															}
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
														<CustomSelect
															label={t('selectBreed')}
															placeholder={t('placeholders.breedHint')}
															value={field.value}
															onChange={field.onChange}
															options={breedOptions}
															disabled={!breedOptions.length}
															required
															error={
																errors.breedUuid
																	? getErrorMessage(errors.breedUuid.message || '')
																	: undefined
															}
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
														<CustomSelect
															label={t('selectGender')}
															placeholder={t('placeholders.genderHint')}
															value={field.value}
															onChange={field.onChange}
															options={genderOptions}
															required
															error={
																errors.gender
																	? getErrorMessage(errors.gender.message || '')
																	: undefined
															}
														/>
													)}
												/>
												<div id="gender-help" className="sr-only">
													{t('accessibility.genderHelp')}
												</div>

												<TextField
													{...register('color')}
													type="text"
													placeholder={t('placeholders.color')}
													label={t('color')}
													error={
														errors.color ? getErrorMessage(errors.color.message || '') : undefined
													}
													aria-describedby="color-help"
													autoComplete="off"
												/>
												<div id="color-help" className="sr-only">
													{t('accessibility.colorHelp')}
												</div>

												<TextField
													{...register('weight', { valueAsNumber: true })}
													type="number"
													placeholder={`${t('placeholders.weight')} (${farm?.weightUnit})`}
													label={`${t('weight')} (${farm?.weightUnit})`}
													onWheel={(e) => e.currentTarget.blur()}
													error={
														errors.weight ? getErrorMessage(errors.weight.message || '') : undefined
													}
													aria-describedby="weight-help"
													min="0"
													step="0.1"
												/>
												<div id="weight-help" className="sr-only">
													{t('accessibility.weightHelp', { unit: farm?.weightUnit })}
												</div>
											</div>
										</fieldset>
									</div>

									{/* Dates Card */}
									<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20">
										<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
											<i className="i-material-symbols-calendar-month w-5! h-5! bg-blue-600! dark:bg-blue-500!" />
											{t('dateInformation')}
										</h3>
										<fieldset className="border-0 p-0 m-0">
											<legend className="sr-only">{t('accessibility.dateInformation')}</legend>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
																errors.birthDate
																	? getErrorMessage(errors.birthDate.message || '')
																	: undefined
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
																		errors.soldDate
																			? getErrorMessage(errors.soldDate.message || '')
																			: undefined
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
																		errors.deathDate
																			? getErrorMessage(errors.deathDate.message || '')
																			: undefined
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
											</div>
										</fieldset>
									</div>

									{/* Health Status Card - Only for editing existing animals */}
									{params.animalUuid && (
										<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20">
											<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
												<i className="i-material-symbols-health-and-safety w-5! h-5! bg-blue-600! dark:bg-blue-500!" />
												{t('healthStatus')}
											</h3>
											<Controller
												name="healthStatus"
												control={control}
												render={({ field }) => (
													<CustomSelect
														label={t('currentHealthStatus')}
														placeholder={t('placeholders.selectHealthStatus')}
														value={field.value}
														onChange={field.onChange}
														options={healthStatusOptions}
														error={
															errors.healthStatus
																? getErrorMessage(errors.healthStatus.message || '')
																: undefined
														}
													/>
												)}
											/>
											<div id="health-status-help" className="sr-only">
												{t('accessibility.healthStatusHelp')}
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
												{t('healthStatusNote')}
											</p>
										</div>
									)}

									{/* Origin Card */}
									<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20">
										<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
											<i className="i-material-symbols-location-on w-5! h-5! bg-blue-600! dark:bg-blue-500!" />
											{t('additionalInfo')}
										</h3>
										<Textarea
											{...register('origin')}
											placeholder={t('placeholders.origin')}
											label={t('origin')}
											error={
												errors.origin ? getErrorMessage(errors.origin.message || '') : undefined
											}
											aria-describedby="origin-help"
										/>
										<div id="origin-help" className="sr-only">
											{t('accessibility.originHelp')}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Submit Button */}
						<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
							<Button
								type="submit"
								className="btn btn-primary h-12 text-lg disabled:loading flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl dark:shadow-blue-900/20 dark:hover:shadow-blue-800/30"
								aria-describedby="add-animal-description"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<i className="i-material-symbols-hourglass-empty w-6! h-6! animate-spin" />
										{t('common:loading')}
									</>
								) : (
									<>
										<i
											className={`w-6! h-6! ${params.animalUuid ? 'i-material-symbols-edit' : 'i-material-symbols-add'}`}
										/>
										{params.animalUuid ? t('editButton') : t('addButton')}
									</>
								)}
							</Button>
							<div id="submit-help" className="sr-only">
								{params.animalUuid
									? t('accessibility.editSubmitHelp')
									: t('accessibility.addSubmitHelp')}
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default memo(AnimalForm)
