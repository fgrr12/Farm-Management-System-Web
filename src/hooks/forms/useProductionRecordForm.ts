import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { formatDateForForm } from '@/utils/date'

import { type ProductionRecordFormData, productionRecordSchema } from '@/schemas'

const DEFAULT_VALUES: Partial<ProductionRecordFormData> = {
	quantity: 0,
	date: dayjs().format('YYYY-MM-DD'),
	notes: '',
	status: true,
}

export const useProductionRecordForm = (initialData?: Partial<ProductionRecord>) => {
	const { t } = useTranslation(['productionRecordForm'])

	const mapToFormData = useCallback(
		(data: Partial<ProductionRecord>): Partial<ProductionRecordFormData> => {
			return {
				uuid: data.uuid || '',
				animalUuid: data.animalUuid || '',
				quantity: data.quantity || 0,
				date: formatDateForForm(data.date) || dayjs().format('YYYY-MM-DD'),
				notes: data.notes || '',
				status: data.status ?? true,
			}
		},
		[]
	)

	const getDefaultValues = useCallback((): Partial<ProductionRecordFormData> => {
		if (!initialData) return DEFAULT_VALUES
		return mapToFormData(initialData)
	}, [initialData, mapToFormData])

	const form = useForm<ProductionRecordFormData>({
		resolver: zodResolver(productionRecordSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

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
