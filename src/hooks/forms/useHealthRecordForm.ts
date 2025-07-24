import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

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
}

export const useHealthRecordForm = (initialData?: Partial<HealthRecord>) => {
	const { t } = useTranslation(['healthRecordForm'])

	const formatDateForForm = useCallback((dateValue: string | Date | null | undefined): string => {
		if (!dateValue) return dayjs().format('YYYY-MM-DD')

		try {
			// If it's already in YYYY-MM-DD format, return as is
			if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
				return dateValue
			}

			// If it's a timestamp or Date object, convert it
			const date = new Date(dateValue)
			if (Number.isNaN(date.getTime())) return dayjs().format('YYYY-MM-DD')

			return dayjs(date).format('YYYY-MM-DD')
		} catch {
			return dayjs().format('YYYY-MM-DD')
		}
	}, [])

	const getDefaultValues = useCallback((): Partial<HealthRecordFormData> => {
		if (!initialData) return DEFAULT_VALUES

		return {
			uuid: initialData.uuid || '',
			animalUuid: initialData.animalUuid || '',
			reason: initialData.reason || '',
			type: initialData.type || '',
			reviewedBy: initialData.reviewedBy || '',
			date: formatDateForForm(initialData.date),
			weight: initialData.weight || 0,
			temperature: initialData.temperature || 0,
			medication: initialData.medication || '',
			dosage: initialData.dosage || '',
			frequency: initialData.frequency || '',
			duration: initialData.duration || '',
			notes: initialData.notes || '',
			createdBy: initialData.createdBy || '',
			status: initialData.status ?? true,
		}
	}, [initialData, formatDateForForm])

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
			weight: data.weight,
			temperature: data.temperature,
			medication: data.medication,
			dosage: data.dosage,
			frequency: data.frequency,
			duration: data.duration,
			notes: data.notes,
			status: data.status ?? true,
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
			if (!data) {
				form.reset(DEFAULT_VALUES)
				return
			}

			const formattedData: Partial<HealthRecordFormData> = {
				uuid: data.uuid || '',
				animalUuid: data.animalUuid || '',
				reason: data.reason || '',
				type: data.type || '',
				reviewedBy: data.reviewedBy || '',
				date: formatDateForForm(data.date),
				weight: data.weight || 0,
				temperature: data.temperature || 0,
				medication: data.medication || '',
				dosage: data.dosage || '',
				frequency: data.frequency || '',
				duration: data.duration || '',
				notes: data.notes || '',
				createdBy: data.createdBy || '',
				status: data.status ?? true,
			}

			form.reset(formattedData)
		},
		[form, formatDateForForm]
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
