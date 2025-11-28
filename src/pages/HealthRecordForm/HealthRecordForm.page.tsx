import dayjs from 'dayjs'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { HealthRecordsService } from '@/services/healthRecords'

import { DatePicker } from '@/components/layout/DatePicker'
import { Button } from '@/components/ui/Button'
import type { CustomSelectOption } from '@/components/ui/CustomSelect'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { useHealthRecordForm } from '@/hooks/forms/useHealthRecordForm'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { HealthRecordFormData } from '@/schemas'

const HealthRecordForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['healthRecordForm'])
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const form = useHealthRecordForm()
	const {
		handleSubmit,
		control,
		setValue,
		register,
		formState: { errors, isSubmitting },
		transformToApiFormat,
		getErrorMessage,
		resetWithData,
	} = form

	const healthRecordTypes: CustomSelectOption[] = useMemo(
		() => [
			{ value: 'Checkup', label: t('healthRecordType.checkup') },
			{ value: 'Vaccination', label: t('healthRecordType.vaccination') },
			{ value: 'Medication', label: t('healthRecordType.medication') },
			{ value: 'Surgery', label: t('healthRecordType.surgery') },
			{ value: 'Pregnancy', label: t('healthRecordType.pregnancy') },
			{ value: 'Deworming', label: t('healthRecordType.deworming') },
			{ value: 'Birth', label: t('healthRecordType.birth') },
			{ value: 'Drying', label: t('healthRecordType.drying') },
		],
		[t]
	)

	const onSubmit = useCallback(
		async (data: HealthRecordFormData) => {
			if (!user) return

			await withLoadingAndError(async () => {
				const healthRecordData = transformToApiFormat(data)
				const healthRecordUuid = params.healthRecordUuid

				if (healthRecordUuid) {
					await HealthRecordsService.updateHealthRecord(healthRecordData, user.uuid, farm!.uuid)
					showToast(t('toast.edited'), 'success')
				} else {
					await HealthRecordsService.setHealthRecord(healthRecordData, user.uuid, farm!.uuid)
					showToast(t('toast.added'), 'success')
				}

				// Health status is now updated automatically by AI on the backend
				navigate(AppRoutes.ANIMAL.replace(':animalUuid', healthRecordData.animalUuid))
			}, t('toast.errorAddingHealthRecord'))
		},
		[
			user,
			farm,
			params.healthRecordUuid,
			transformToApiFormat,
			withLoadingAndError,
			showToast,
			t,
			navigate,
		]
	)

	const getHealthRecord = useCallback(async () => {
		await withLoadingAndError(async () => {
			if (!params.healthRecordUuid) return null

			const healthRecordUuid = params.healthRecordUuid
			const healthRecord = await HealthRecordsService.getHealthRecord(healthRecordUuid)
			resetWithData(healthRecord)
			return healthRecord
		}, t('toast.errorGettingHealthRecord'))
	}, [params.healthRecordUuid, withLoadingAndError, t, resetWithData])

	useEffect(() => {
		if (!user) return
		const animalUuid = params.animalUuid
		setValue('animalUuid', animalUuid || '')
		if (params.healthRecordUuid) {
			getHealthRecord()
		}
	}, [user, params.animalUuid, params.healthRecordUuid, getHealthRecord, setValue])

	useEffect(() => {
		setPageTitle(params.healthRecordUuid ? t('editHealthRecordTitle') : t('addHealthRecordTitle'))
	}, [params.healthRecordUuid, setPageTitle, t])

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
			<div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				<a
					href="#health-record-form"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
				>
					{t('accessibility.skipToForm')}
				</a>

				{/* Hero Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700">
					<div className="bg-linear-to-r from-blue-600 to-green-600 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
								<i className="i-material-symbols-health-and-safety bg-white! w-6! h-6! sm:w-8! sm:h-8!" />
							</div>
							<div className="min-w-0">
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
									{params.healthRecordUuid ? t('editHealthRecordTitle') : t('addHealthRecordTitle')}
								</h1>
								<p className="text-blue-100 text-sm sm:text-base mt-1">
									{params.healthRecordUuid ? t('editSubtitle') : t('addSubtitle')}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Form Container */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
					<form
						id="health-record-form"
						className="p-4 sm:p-6 lg:p-8"
						onSubmit={handleSubmit(onSubmit)}
						autoComplete="off"
						aria-labelledby="form-heading"
						noValidate
					>
						<h2 id="form-heading" className="sr-only">
							{params.healthRecordUuid
								? t('accessibility.editHealthRecordForm')
								: t('accessibility.addHealthRecordForm')}
						</h2>

						<div className="space-y-6">
							{/* Basic Information Card */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-material-symbols-info bg-blue-600! w-5! h-5!" />
									{t('basicInformation')}
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<TextField
										{...register('reason')}
										type="text"
										placeholder={t('placeholders.reason')}
										label={t('reason')}
										required
										error={errors.reason ? getErrorMessage(errors.reason.message || '') : undefined}
									/>
									<Controller
										name="type"
										control={control}
										render={({ field }) => (
											<CustomSelect
												label={t('selectType')}
												placeholder={t('placeholders.selectType')}
												value={field.value}
												onChange={field.onChange}
												options={healthRecordTypes}
												required
												error={errors.type ? getErrorMessage(errors.type.message || '') : undefined}
											/>
										)}
									/>
									<TextField
										{...register('reviewedBy')}
										type="text"
										placeholder={t('placeholders.reviewedBy')}
										label={t('reviewedBy')}
										required
										error={
											errors.reviewedBy
												? getErrorMessage(errors.reviewedBy.message || '')
												: undefined
										}
									/>
									<Controller
										name="date"
										control={control}
										render={({ field }) => (
											<DatePicker
												legend={t('date')}
												label={t('date')}
												date={dayjs(field.value)}
												onDateChange={(date) => {
													field.onChange(dayjs(date).format('YYYY-MM-DD'))
												}}
												error={errors.date ? getErrorMessage(errors.date.message || '') : undefined}
											/>
										)}
									/>
								</div>
							</div>

							{/* Physical Measurements Card */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-material-symbols-monitor-weight bg-blue-600! w-5! h-5!" />
									{t('physicalMeasurements')}
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
									<TextField
										{...register('temperature', { valueAsNumber: true })}
										type="number"
										placeholder={`${t('placeholders.temperature')} (${farm?.temperatureUnit})`}
										label={`${t('temperature')} (${farm?.temperatureUnit})`}
										onWheel={(e) => e.currentTarget.blur()}
										error={
											errors.temperature
												? getErrorMessage(errors.temperature.message || '')
												: undefined
										}
										min="0"
										step="0.1"
									/>
								</div>
							</div>

							{/* Medication Details Card */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-material-symbols-medication bg-blue-600! w-5! h-5!" />
									{t('medicationDetails')}
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<TextField
										{...register('medication')}
										type="text"
										placeholder={t('placeholders.medication')}
										label={t('medication')}
										error={
											errors.medication
												? getErrorMessage(errors.medication.message || '')
												: undefined
										}
									/>
									<TextField
										{...register('dosage')}
										type="text"
										placeholder={t('placeholders.dosage')}
										label={t('dosage')}
										error={errors.dosage ? getErrorMessage(errors.dosage.message || '') : undefined}
									/>
									<TextField
										{...register('frequency')}
										type="text"
										placeholder={t('placeholders.frequency')}
										label={t('frequency')}
										error={
											errors.frequency ? getErrorMessage(errors.frequency.message || '') : undefined
										}
									/>
									<TextField
										{...register('duration')}
										type="text"
										placeholder={t('placeholders.duration')}
										label={t('duration')}
										error={
											errors.duration ? getErrorMessage(errors.duration.message || '') : undefined
										}
									/>
								</div>
							</div>

							{/* Notes Card */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-material-symbols-notes bg-blue-600! w-5! h-5!" />
									{t('additionalNotes')}
								</h3>
								<Textarea
									{...register('notes')}
									placeholder={t('placeholders.notes')}
									label={t('notes')}
									required
									error={errors.notes ? getErrorMessage(errors.notes.message || '') : undefined}
								/>
							</div>
						</div>

						{/* Submit Button */}
						<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
							<Button
								type="submit"
								disabled={isSubmitting}
								className="btn btn-primary h-12 w-full text-lg disabled:loading flex items-center justify-center gap-2"
							>
								{isSubmitting ? (
									<>
										<i className="i-material-symbols-hourglass-empty bg-white! w-5! h-5! animate-spin" />
										{t('common:loading')}
									</>
								) : (
									<>
										<i
											className={`${params.healthRecordUuid ? 'i-material-symbols-edit' : 'i-material-symbols-add'} bg-white! w-5! h-5!`}
										/>
										{params.healthRecordUuid ? t('editButton') : t('addButton')}
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default memo(HealthRecordForm)
