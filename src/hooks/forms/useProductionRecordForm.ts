import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useFormTransforms } from '@/hooks/shared/useFormTransforms'

import { type ProductionRecordFormData, productionRecordSchema } from '@/schemas'

const DEFAULT_VALUES: Partial<ProductionRecordFormData> = {
	quantity: 0,
	date: dayjs().format('YYYY-MM-DD'),
	notes: '',
	status: true,
}

export const useProductionRecordForm = (initialData?: Partial<ProductionRecord>) => {
	const { t } = useTranslation(['productionRecordForm'])

	const formatDateForForm = useCallback((dateValue: string | Date | null | undefined): string => {
		if (!dateValue) return dayjs().format('YYYY-MM-DD')

		try {
			if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
				return dateValue
			}

			const date = new Date(dateValue)
			if (Number.isNaN(date.getTime())) return dayjs().format('YYYY-MM-DD')

			return dayjs(date).format('YYYY-MM-DD')
		} catch {
			return dayjs().format('YYYY-MM-DD')
		}
	}, [])

	const getDefaultValues = useCallback((): Partial<ProductionRecordFormData> => {
		if (!initialData) return DEFAULT_VALUES

		return {
			uuid: initialData.uuid || '',
			animalUuid: initialData.animalUuid || '',
			quantity: initialData.quantity || 0,
			date: formatDateForForm(initialData.date),
			notes: initialData.notes || '',
			status: initialData.status ?? true,
		}
	}, [initialData, formatDateForForm])

	const form = useForm<ProductionRecordFormData>({
		resolver: zodResolver(productionRecordSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const { register, setValue } = form

	const { registerNumber, registerTextareaCapitalized } = useFormTransforms(register, setValue)

	const typedRegisterNumber = useCallback(
		(fieldName: keyof ProductionRecordFormData) => registerNumber(fieldName),
		[registerNumber]
	)

	const typedRegisterTextareaCapitalized = useCallback(
		(fieldName: keyof ProductionRecordFormData) => registerTextareaCapitalized(fieldName),
		[registerTextareaCapitalized]
	)

	const transformToApiFormat = useCallback((data: ProductionRecordFormData): ProductionRecord => {
		return {
			uuid: data.uuid || crypto.randomUUID(),
			animalUuid: data.animalUuid || '',
			quantity: data.quantity,
			date: typeof data.date === 'string' ? data.date : dayjs(data.date).format('YYYY-MM-DD'),
			notes: data.notes,
			status: data.status ?? true,
		}
	}, [])

	const getErrorMessage = useCallback(
		(error: string): string => {
			if (error.startsWith('productionRecord.validation.')) {
				return t(error.replace('productionRecord.', ''))
			}
			return error
		},
		[t]
	)

	const resetWithData = useCallback(
		(data?: Partial<ProductionRecord>) => {
			if (!data) {
				form.reset(DEFAULT_VALUES)
				return
			}

			const formattedData: Partial<ProductionRecordFormData> = {
				uuid: data.uuid || '',
				animalUuid: data.animalUuid || '',
				quantity: data.quantity || 0,
				date: formatDateForForm(data.date),
				notes: data.notes || '',
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
		registerNumber: typedRegisterNumber,
		registerTextareaCapitalized: typedRegisterTextareaCapitalized,
		isValid: form.formState.isValid,
		isDirty: form.formState.isDirty,
		isSubmitting: form.formState.isSubmitting,
		errors: form.formState.errors,
	}
}
