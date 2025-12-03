import dayjs from 'dayjs'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { DatePicker } from '@/components/layout/DatePicker'
import { FormLayout } from '@/components/layout/FormLayout'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import type { CustomSelectOption } from '@/components/ui/CustomSelect'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { useHealthRecordForm } from '@/hooks/forms/useHealthRecordForm'
import {
	useCreateHealthRecord,
	useHealthRecord,
	useUpdateHealthRecord,
} from '@/hooks/queries/useHealthRecords'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { HealthRecordFormData } from '@/schemas'

const HealthRecordForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['healthRecordForm'])
	const { setPageTitle, showToast, withError } = usePagePerformance()

	const healthRecordUuid = params.healthRecordUuid
	const { data: healthRecord } = useHealthRecord(healthRecordUuid || '')
	const createHealthRecord = useCreateHealthRecord()
	const updateHealthRecord = useUpdateHealthRecord()

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
			{ value: 'HoofCare', label: t('healthRecordType.hoofCare') },
			{ value: 'Castration', label: t('healthRecordType.castration') },
			{ value: 'Dehorning', label: t('healthRecordType.dehorning') },
		],
		[t]
	)

	const administrationRoutes: CustomSelectOption[] = useMemo(
		() => [
			{ value: 'IM', label: t('routes.im') },
			{ value: 'SC', label: t('routes.sc') },
			{ value: 'Oral', label: t('routes.oral') },
			{ value: 'Topical', label: t('routes.topical') },
			{ value: 'Intramammary', label: t('routes.intramammary') },
			{ value: 'IV', label: t('routes.iv') },
			{ value: 'Intrauterine', label: t('routes.intrauterine') },
			{ value: 'Other', label: t('routes.other') },
		],
		[t]
	)

	const injectionSites: CustomSelectOption[] = useMemo(
		() => [
			{ value: 'Neck', label: t('sites.neck') },
			{ value: 'Rump', label: t('sites.rump') },
			{ value: 'Leg', label: t('sites.leg') },
			{ value: 'Ear', label: t('sites.ear') },
			{ value: 'Flank', label: t('sites.flank') },
			{ value: 'Tail', label: t('sites.tail') },
			{ value: 'Other', label: t('sites.other') },
		],
		[t]
	)

	const selectedType = useWatch({ control, name: 'type' })
	const withdrawalDays = useWatch({ control, name: 'withdrawalDays' })
	const date = useWatch({ control, name: 'date' })

	const reasonLabel = useMemo(() => {
		if (['Sick', 'Critical', 'Treatment', 'Surgery'].includes(selectedType)) return t('diagnosis')
		if (selectedType === 'Checkup') return t('observation')
		if (['Vaccination', 'Deworming'].includes(selectedType)) return t('protocolName')
		return t('reason')
	}, [selectedType, t])

	const showMedicationFields = ['Medication', 'Sick', 'Critical', 'Treatment', 'Surgery'].includes(
		selectedType
	)
	const showVaccineFields = ['Vaccination', 'Deworming'].includes(selectedType)
	const showWithdrawalFields = ['Medication', 'Sick', 'Critical', 'Treatment'].includes(
		selectedType
	)
	const showPhysicalFields = !['Drying', 'Birth'].includes(selectedType)

	const withdrawalEndDate = useMemo(() => {
		if (!withdrawalDays || !date) return null
		return dayjs(date).add(withdrawalDays, 'day').format('YYYY-MM-DD')
	}, [withdrawalDays, date])

	const onSubmit = useCallback(
		async (data: HealthRecordFormData) => {
			if (!user) return

			await withError(async () => {
				const healthRecordData = {
					...transformToApiFormat(data),
					farmUuid: farm!.uuid,
				}
				const healthRecordUuid = params.healthRecordUuid

				if (healthRecordUuid) {
					await updateHealthRecord.mutateAsync({
						healthRecord: healthRecordData,
						userUuid: user.uuid,
					})
					showToast(t('toast.edited'), 'success')
				} else {
					await createHealthRecord.mutateAsync({
						healthRecord: healthRecordData,
						userUuid: user.uuid,
					})
					showToast(t('toast.added'), 'success')
				}

				navigate(AppRoutes.ANIMAL.replace(':animalUuid', healthRecordData.animalUuid))
			}, t('toast.errorAddingHealthRecord'))
		},
		[
			user,
			params.healthRecordUuid,
			transformToApiFormat,
			withError,
			showToast,
			t,
			navigate,
			createHealthRecord,
			updateHealthRecord,
			farm,
		]
	)

	useEffect(() => {
		if (healthRecord) {
			resetWithData(healthRecord)
		}
	}, [healthRecord, resetWithData])

	useEffect(() => {
		if (!user) return
		const animalUuid = params.animalUuid
		setValue('animalUuid', animalUuid || '')
	}, [user, params.animalUuid, setValue])

	useEffect(() => {
		setPageTitle(params.healthRecordUuid ? t('editHealthRecordTitle') : t('addHealthRecordTitle'))
	}, [params.healthRecordUuid, setPageTitle, t])

	const isEditing = !!params.healthRecordUuid

	// Withdrawal Alert Component
	const WithdrawalAlert = () => {
		if (!withdrawalEndDate) return null
		return (
			<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6 animate-fade-in mb-6">
				<div className="flex items-start gap-3">
					<i className="i-material-symbols-warning bg-red-600! w-6! h-6! shrink-0 mt-1" />
					<div>
						<h3 className="text-lg font-bold text-red-800 dark:text-red-200">
							{t('withdrawalPeriodActive')}
						</h3>
						<p className="text-red-700 dark:text-red-300 mt-1">
							{t('withdrawalWarning', {
								date: dayjs(withdrawalEndDate).format('DD/MM/YYYY'),
							})}
						</p>
						<p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">
							⚠️ {t('doNotSellOrMilk')}
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<PageContainer maxWidth="4xl">
			<PageHeader
				icon="health-and-safety"
				title={isEditing ? t('editHealthRecordTitle') : t('addHealthRecordTitle')}
				subtitle={isEditing ? t('editSubtitle') : t('addSubtitle')}
				variant="compact"
			/>

			<FormLayout
				sections={[
					{
						title: t('basicInformation'),
						icon: 'info',
						columns: 2,
						children: (
							<>
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
								<div className="sm:col-span-2">
									<TextField
										{...register('reason')}
										type="text"
										placeholder={t('placeholders.reason')}
										label={reasonLabel}
										required
										error={errors.reason ? getErrorMessage(errors.reason.message || '') : undefined}
									/>
								</div>
								<TextField
									{...register('reviewedBy')}
									type="text"
									placeholder={t('placeholders.reviewedBy')}
									label={t('reviewedBy')}
									required
									error={
										errors.reviewedBy ? getErrorMessage(errors.reviewedBy.message || '') : undefined
									}
								/>
								{showVaccineFields && (
									<TextField
										{...register('technician')}
										type="text"
										placeholder={t('placeholders.technician')}
										label={t('technician')}
									/>
								)}
							</>
						),
					},
					...(showMedicationFields || showWithdrawalFields || showVaccineFields
						? [
								{
									title: showVaccineFields ? t('vaccinationDetails') : t('treatmentDetails'),
									icon: 'medication',
									columns: 2 as const,
									children: (
										<>
											<div className="sm:col-span-2">
												<WithdrawalAlert />
											</div>

											<TextField
												{...register('medication')}
												type="text"
												placeholder={
													showVaccineFields
														? t('placeholders.vaccineName')
														: t('placeholders.medication')
												}
												label={showVaccineFields ? t('vaccineName') : t('medication')}
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
												error={
													errors.dosage ? getErrorMessage(errors.dosage.message || '') : undefined
												}
											/>

											{showVaccineFields && (
												<>
													<TextField
														{...register('batchNumber')}
														type="text"
														placeholder={t('placeholders.batchNumber')}
														label={t('batchNumber')}
													/>
													<TextField
														{...register('manufacturer')}
														type="text"
														placeholder={t('placeholders.manufacturer')}
														label={t('manufacturer')}
													/>
												</>
											)}

											{(showMedicationFields || showWithdrawalFields) && (
												<>
													<Controller
														name="administrationRoute"
														control={control}
														render={({ field }) => (
															<CustomSelect
																label={t('administrationRoute')}
																placeholder={t('placeholders.selectRoute')}
																value={field.value || undefined}
																onChange={field.onChange}
																options={administrationRoutes}
															/>
														)}
													/>
													<Controller
														name="injectionSite"
														control={control}
														render={({ field }) => (
															<CustomSelect
																label={t('injectionSite')}
																placeholder={t('placeholders.selectSite')}
																value={field.value || undefined}
																onChange={field.onChange}
																options={injectionSites}
															/>
														)}
													/>
													<TextField
														{...register('frequency')}
														type="text"
														placeholder={t('placeholders.frequency')}
														label={t('frequency')}
													/>
													<TextField
														{...register('duration')}
														type="text"
														placeholder={t('placeholders.duration')}
														label={t('duration')}
													/>
												</>
											)}

											{showWithdrawalFields && (
												<div className="sm:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
													<TextField
														{...register('withdrawalDays', { valueAsNumber: true })}
														type="number"
														placeholder="0"
														label={t('withdrawalDays')}
														min="0"
														className="font-bold text-red-600"
													/>
													<p className="text-xs text-gray-500 mt-1">{t('withdrawalDaysHelp')}</p>
												</div>
											)}
										</>
									),
								},
							]
						: []),
					...(showPhysicalFields
						? [
								{
									title: t('physicalMeasurements'),
									icon: 'monitor-weight',
									columns: 2 as const,
									children: (
										<>
											<TextField
												{...register('weight', { valueAsNumber: true })}
												type="number"
												placeholder={`${t('placeholders.weight')} (${farm?.weightUnit})`}
												label={`${t('weight')} (${farm?.weightUnit})`}
												onWheel={(e) => e.currentTarget.blur()}
												error={
													errors.weight ? getErrorMessage(errors.weight.message || '') : undefined
												}
												min="0"
												step="0.1"
											/>
											{!showVaccineFields && (
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
											)}
										</>
									),
								},
							]
						: []),
					{
						title: t('additionalNotes'),
						icon: 'notes',
						columns: 1,
						children: (
							<Textarea
								{...register('notes')}
								placeholder={t('placeholders.notes')}
								label={t('notes')}
								required
								error={errors.notes ? getErrorMessage(errors.notes.message || '') : undefined}
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

export default memo(HealthRecordForm)
