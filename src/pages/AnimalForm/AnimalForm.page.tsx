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
import { FormLayout } from '@/components/layout/FormLayout'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import type { CustomSelectOption } from '@/components/ui/CustomSelect'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { useAnimalForm } from '@/hooks/forms/useAnimalForm'
import { useCreateAnimal, useUpdateAnimal } from '@/hooks/queries/useAnimals'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { AnimalFormData } from '@/schemas'

const AnimalForm = () => {
	const { user } = useUserStore()
	const { farm, species, breeds } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['animalForm'])

	const { setPageTitle, showToast, withError, withLoadingAndError } = usePagePerformance()

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

	const createAnimal = useCreateAnimal()
	const updateAnimal = useUpdateAnimal()

	const onSubmit = useCallback(
		async (data: AnimalFormData) => {
			if (!user || !farm) return

			await withError(async () => {
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
					await updateAnimal.mutateAsync({ animal: animalData, userUuid: user.uuid })
					showToast(t('toast.edited'), 'success')
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', animalUuid))
				} else {
					const newAnimalUuid = await createAnimal.mutateAsync({
						animal: animalData,
						userUuid: user.uuid,
					})
					showToast(t('toast.added'), 'success')
					reset()
					setPictureUrl('')
					if (newAnimalUuid) {
						navigate(AppRoutes.ANIMAL.replace(':animalUuid', newAnimalUuid))
					}
				}
			}, t('toast.errorAddingAnimal'))
		},
		[
			user,
			farm,
			params.animalUuid,
			transformToApiFormat,
			createAnimal,
			updateAnimal,
			showToast,
			t,
			navigate,
			reset,
			withError,
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

	const isEditing = !!params.animalUuid

	// Photo Sidebar Component
	const PhotoSidebar = () => (
		<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
				<i className="i-material-symbols-photo-camera w-5! h-5! bg-blue-600! dark:bg-blue-500!" />
				{t('animalPhoto')}
			</h3>
			<Dropzone
				className="dropzone w-full h-64 sm:h-80"
				cleanFile={false}
				pictureUrl={pictureUrl}
				onFile={handleFile}
			/>
			<p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">{t('photoHint')}</p>
		</div>
	)

	return (
		<PageContainer maxWidth="4xl">
			<PageHeader
				icon="pets"
				title={isEditing ? t('editAnimal') : t('addAnimal')}
				subtitle={isEditing ? t('editSubtitle') : t('addSubtitle')}
				variant="compact"
			/>

			<FormLayout
				sidebar={<PhotoSidebar />}
				sections={[
					{
						title: t('basicInformation'),
						icon: 'info',
						columns: 2,
						children: (
							<>
								<TextField
									{...register('animalId')}
									type="text"
									placeholder={t('placeholders.animalId')}
									label={t('animalId')}
									required
									error={
										errors.animalId ? getErrorMessage(errors.animalId.message || '') : undefined
									}
									autoComplete="off"
								/>

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
												errors.gender ? getErrorMessage(errors.gender.message || '') : undefined
											}
										/>
									)}
								/>

								<TextField
									{...register('color')}
									type="text"
									placeholder={t('placeholders.color')}
									label={t('color')}
									error={errors.color ? getErrorMessage(errors.color.message || '') : undefined}
									autoComplete="off"
								/>

								<TextField
									{...register('weight', { valueAsNumber: true })}
									type="number"
									placeholder={`${t('placeholders.weight')} (${farm?.weightUnit})`}
									label={`${t('weight')} (${farm?.weightUnit})`}
									onWheel={(e) => e.currentTarget.blur()}
									error={errors.weight ? getErrorMessage(errors.weight.message || '') : undefined}
									min="0"
									step="0.1"
								/>
							</>
						),
					},
					{
						title: t('dateInformation'),
						icon: 'calendar-month',
						columns: 2,
						children: (
							<>
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
										/>
									)}
								/>

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
										/>
									)}
								/>

								{isEditing && (
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
												/>
											)}
										/>

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
												/>
											)}
										/>
									</>
								)}
							</>
						),
					},
					...(isEditing
						? [
								{
									title: t('healthStatus'),
									icon: 'health-and-safety',
									columns: 1 as const,
									children: (
										<>
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
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{t('healthStatusNote')}
											</p>
										</>
									),
								},
							]
						: []),
					{
						title: t('additionalInfo'),
						icon: 'location-on',
						columns: 1,
						children: (
							<Textarea
								{...register('origin')}
								placeholder={t('placeholders.origin')}
								label={t('origin')}
								error={errors.origin ? getErrorMessage(errors.origin.message || '') : undefined}
								rows={4}
							/>
						),
					},
				]}
				onSubmit={handleSubmit(onSubmit)}
				submitButton={{
					label: isEditing ? t('editButton') : t('addButton'),
					isSubmitting,
					icon: isEditing ? 'edit' : 'add',
				}}
			/>
		</PageContainer>
	)
}

export default memo(AnimalForm)
