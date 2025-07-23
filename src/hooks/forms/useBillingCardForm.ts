import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { type BillingCardFormData, billingCardSchema } from '@/schemas'

const DEFAULT_VALUES: Partial<BillingCardFormData> = {
	id: '',
	name: '',
	email: '',
	phone: '',
	address: '',
	status: false,
}

export const useBillingCardForm = (initialData?: Partial<BillingCard>) => {
	const { t } = useTranslation(['myAccount'])

	const getDefaultValues = useCallback((): Partial<BillingCardFormData> => {
		if (!initialData) return DEFAULT_VALUES

		return {
			uuid: initialData.uuid || '',
			id: initialData.id || '',
			name: initialData.name || '',
			email: initialData.email || '',
			phone: initialData.phone || '',
			address: initialData.address || '',
			status: initialData.status ?? false,
		}
	}, [initialData])

	const form = useForm<BillingCardFormData>({
		resolver: zodResolver(billingCardSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const transformToApiFormat = useCallback((data: BillingCardFormData): BillingCard => {
		return {
			uuid: data.uuid || crypto.randomUUID(),
			id: data.id,
			name: data.name,
			email: data.email,
			phone: data.phone,
			address: data.address,
			status: data.status ?? false,
		}
	}, [])

	const getErrorMessage = useCallback(
		(error: string): string => {
			if (error.startsWith('billingCard.validation.')) {
				return t(error.replace('billingCard.', ''))
			}
			return error
		},
		[t]
	)

	const resetWithData = useCallback(
		(data?: Partial<BillingCard>) => {
			if (!data) {
				form.reset(DEFAULT_VALUES)
				return
			}

			const formattedData: Partial<BillingCardFormData> = {
				uuid: data.uuid || '',
				id: data.id || '',
				name: data.name || '',
				email: data.email || '',
				phone: data.phone || '',
				address: data.address || '',
				status: data.status ?? false,
			}

			form.reset(formattedData)
		},
		[form]
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
