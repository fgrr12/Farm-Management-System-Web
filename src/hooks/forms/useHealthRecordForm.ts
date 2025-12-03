import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { formatDateForForm } from '@/utils/date'

import { type HealthRecordFormData, healthRecordSchema } from '@/schemas'

const DEFAULT_VALUES: Partial<HealthRecordFormData> = {
	reason: '',
	type: '',
	reviewedBy: '',
	date: dayjs().format('YYYY-MM-DD'),
	weight: 0,
	temperature: 0,
	medication: '',
	dosage: '',
	frequency: '',
	duration: '',
	notes: '',
	status: true,
	withdrawalDays: undefined,
	withdrawalEndDate: undefined,
	administrationRoute: undefined,
	injectionSite: undefined,
	batchNumber: '',
	manufacturer: '',
	technician: '',
}

export const useHealthRecordForm = (initialData?: Partial<HealthRecord>) => {
	const { t } = useTranslation(['healthRecordForm'])

	const mapToFormData = useCallback(
		(data: Partial<HealthRecord>): Partial<HealthRecordFormData> => {
			return {
				uuid: data.uuid || '',
				animalUuid: data.animalUuid || '',
				reason: data.reason || '',
				type: data.type || '',
				reviewedBy: data.reviewedBy || '',
				date: formatDateForForm(data.date) || dayjs().format('YYYY-MM-DD'),
				weight: data.weight || 0,
				temperature: data.temperature || 0,
				medication: data.medication || '',
				dosage: data.dosage || '',
				frequency: data.frequency || '',
				duration: data.duration || '',
				notes: data.notes || '',
				createdBy: data.createdBy || '',
				status: data.status ?? true,
				withdrawalDays: data.withdrawalDays || undefined,
				withdrawalEndDate: data.withdrawalEndDate || undefined,
				administrationRoute: data.administrationRoute || undefined,
				injectionSite: data.injectionSite || undefined,
				batchNumber: data.batchNumber || '',
				manufacturer: data.manufacturer || '',
				technician: data.technician || '',
			}
		},
		[]
	)

	const getDefaultValues = useCallback((): Partial<HealthRecordFormData> => {
		if (!initialData) return DEFAULT_VALUES
		return mapToFormData(initialData)
	}, [initialData, mapToFormData])

	const form = useForm<HealthRecordFormData>({
		resolver: zodResolver(healthRecordSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const transformToApiFormat = useCallback((data: HealthRecordFormData): HealthRecord => {
		return {
			uuid: data.uuid || crypto.randomUUID(),
			animalUuid: data.animalUuid || '',
			reason: data.reason,
			type: data.type as HealthRecordType,
			reviewedBy: data.reviewedBy,
			createdBy: data.createdBy || '',
			date: typeof data.date === 'string' ? data.date : dayjs(data.date).format('YYYY-MM-DD'),
			weight: data.weight || 0,
			temperature: data.temperature || 0,
			medication: data.medication || '',
			dosage: data.dosage || '',
			frequency: data.frequency || '',
			duration: data.duration || '',
			notes: data.notes || '',
			status: data.status ?? true,
			withdrawalDays: data.withdrawalDays || undefined,
			withdrawalEndDate: data.withdrawalEndDate || undefined,
			administrationRoute: data.administrationRoute || undefined,
			injectionSite: data.injectionSite || undefined,
			batchNumber: data.batchNumber || '',
			manufacturer: data.manufacturer || '',
			technician: data.technician || '',
		}
	}, [])

	const getErrorMessage = useCallback(
		(error: string): string => {
			if (error.startsWith('healthRecord.validation.')) {
				return t(error.replace('healthRecord.', ''))
			}
			return error
		},
		[t]
	)

	const resetWithData = useCallback(
		(data?: Partial<HealthRecord>) => {
			const values = data ? mapToFormData(data) : DEFAULT_VALUES
			form.reset(values)
		},
		[form, mapToFormData]
	)

	return {
		...form,
		transformToApiFormat,
		getErrorMessage,
		resetWithData,
		isValid: form.formState.isValid,
		isDirty: form.formState.isDirty,
		isSubmitting: form.formState.isSubmitting,
		errors: form.formState.errors,
	}
}
