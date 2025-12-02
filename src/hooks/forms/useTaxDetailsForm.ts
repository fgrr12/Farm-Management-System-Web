import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { type TaxDetailsFormData, taxDetailsSchema } from '@/schemas/tax-details.schema'

const DEFAULT_VALUES: TaxDetailsFormData = {
	uuid: '',
	id: '',
	name: '',
	email: '',
	phone: '',
	address: '',
	activities: [],
	status: false,
}

export const useTaxDetailsForm = (initialData?: Partial<TaxDetails>) => {
	const { t } = useTranslation('taxDetails')

	const mapToFormData = useCallback((data: Partial<TaxDetails>): TaxDetailsFormData => {
		return {
			uuid: data.uuid || '',
			id: data.id || '',
			name: data.name || '',
			email: data.email || '',
			phone: data.phone || '',
			address: data.address || '',
			activities: data.activities || [],
			status: data.status ?? false,
		}
	}, [])

	const getDefaultValues = useCallback((): TaxDetailsFormData => {
		if (!initialData) return DEFAULT_VALUES
		return mapToFormData(initialData)
	}, [initialData, mapToFormData])

	const form = useForm<TaxDetailsFormData>({
		resolver: zodResolver(taxDetailsSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const transformToApiFormat = useCallback((data: TaxDetailsFormData): TaxDetails => {
		return {
			uuid: data.uuid || crypto.randomUUID(),
			id: data.id,
			name: data.name,
			email: data.email,
			phone: data.phone,
			address: data.address,
			activities: data.activities,
			status: data.status ?? false,
		}
	}, [])

	const getErrorMessage = useCallback(
		(error: string): string => {
			if (error.startsWith('taxDetails.validation.')) {
				return t(error.replace('taxDetails.', ''))
			}
			return error
		},
		[t]
	)

	const resetWithData = useCallback(
		(data?: Partial<TaxDetails>) => {
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
