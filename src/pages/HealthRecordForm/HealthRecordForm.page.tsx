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
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { useHealthRecordForm } from '@/hooks/forms/useHealthRecordForm'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { HealthRecordFormData } from '@/schemas'

interface HealthRecordFormType {
	value: string
	name: string
}

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
		registerCapitalized,
		registerTextareaCapitalized,
		registerNumber,
	} = form

	const healthRecordTypes: HealthRecordFormType[] = useMemo(
		() => [
			{ value: 'Checkup', name: t('healthRecordType.checkup') },
			{ value: 'Vaccination', name: t('healthRecordType.vaccination') },
			{ value: 'Medication', name: t('healthRecordType.medication') },
			{ value: 'Surgery', name: t('healthRecordType.surgery') },
			{ value: 'Pregnancy', name: t('healthRecordType.pregnancy') },
			{ value: 'Deworming', name: t('healthRecordType.deworming') },
			{ value: 'Birth', name: t('healthRecordType.birth') },
			{ value: 'Drying', name: t('healthRecordType.drying') },
		],
		[t]
	)

	const onSubmit = useCallback(
		async (data: HealthRecordFormData) => {
			if (!user) return

			await withLoadingAndError(async () => {
				const healthRecordData = transformToApiFormat(data)
				const healthRecordUuid = params.healthRecordUuid
				healthRecordData.uuid = healthRecordUuid ?? crypto.randomUUID()

				if (healthRecordUuid) {
					await HealthRecordsService.updateHealthRecord(healthRecordData, user.uuid)
					showToast(t('toast.edited'), 'success')
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', healthRecordData.animalUuid))
				} else {
					await HealthRecordsService.setHealthRecord(healthRecordData, user.uuid)
					showToast(t('toast.added'), 'success')
					navigate(AppRoutes.ANIMAL.replace(':animalUuid', healthRecordData.animalUuid))
				}
			}, t('toast.errorAddingHealthRecord'))
		},
		[
			user,
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
		<div className="flex flex-col justify-center items-center w-full overflow-auto p-5">
			<form
				className="flex flex-col sm:grid sm:grid-cols-2 items-center gap-4 max-w-[800px] w-full"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
			>
				<TextField
					{...registerCapitalized('reason')}
					type="text"
					placeholder={t('reason')}
					label={t('reason')}
					required
					error={errors.reason ? getErrorMessage(errors.reason.message || '') : undefined}
				/>
				<Controller
					name="type"
					control={control}
					render={({ field }) => (
						<Select
							{...field}
							legend={t('selectType')}
							defaultLabel={t('selectType')}
							items={healthRecordTypes}
							required
							error={errors.type ? getErrorMessage(errors.type.message || '') : undefined}
						/>
					)}
				/>
				<TextField
					{...registerCapitalized('reviewedBy')}
					type="text"
					placeholder={t('reviewedBy')}
					label={t('reviewedBy')}
					required
					error={errors.reviewedBy ? getErrorMessage(errors.reviewedBy.message || '') : undefined}
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
				<TextField
					{...registerNumber('weight')}
					type="number"
					placeholder={`${t('weight')} (${farm?.weightUnit})`}
					label={`${t('weight')} (${farm?.weightUnit})`}
					onWheel={(e) => e.currentTarget.blur()}
					error={errors.weight ? getErrorMessage(errors.weight.message || '') : undefined}
				/>
				<TextField
					{...registerNumber('temperature')}
					type="number"
					placeholder={`${t('temperature')} (${farm?.temperatureUnit})`}
					label={`${t('temperature')} (${farm?.temperatureUnit})`}
					onWheel={(e) => e.currentTarget.blur()}
					error={errors.temperature ? getErrorMessage(errors.temperature.message || '') : undefined}
				/>
				<TextField
					{...register('medication')}
					type="text"
					placeholder="-"
					label={t('medication')}
					error={errors.medication ? getErrorMessage(errors.medication.message || '') : undefined}
				/>
				<TextField
					{...register('dosage')}
					type="text"
					placeholder="-"
					label={t('dosage')}
					error={errors.dosage ? getErrorMessage(errors.dosage.message || '') : undefined}
				/>
				<TextField
					{...register('frequency')}
					type="text"
					placeholder="-"
					label={t('frequency')}
					error={errors.frequency ? getErrorMessage(errors.frequency.message || '') : undefined}
				/>
				<TextField
					{...register('duration')}
					type="text"
					placeholder="-"
					label={t('duration')}
					error={errors.duration ? getErrorMessage(errors.duration.message || '') : undefined}
				/>
				<div className="col-span-2 w-full">
					<Textarea
						{...registerTextareaCapitalized('notes')}
						placeholder={t('notes')}
						label={t('notes')}
						required
						error={errors.notes ? getErrorMessage(errors.notes.message || '') : undefined}
					/>
				</div>
				<div className="col-span-2 w-full">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting
							? t('common:loading')
							: params.healthRecordUuid
								? t('editButton')
								: t('addButton')}
					</Button>
				</div>
			</form>
		</div>
	)
}

export default memo(HealthRecordForm)
