import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { type FarmFormData, farmSchema } from '@/schemas'

const DEFAULT_VALUES: Partial<FarmFormData> = {
	name: '',
	address: '',
	liquidUnit: 'L',
	weightUnit: 'Kg',
	temperatureUnit: '°C',
	status: true,
}

export const useFarmForm = (initialData?: Partial<Farm>) => {
	const { t } = useTranslation(['myAccount'])

	const getDefaultValues = useCallback((): Partial<FarmFormData> => {
		if (!initialData) return DEFAULT_VALUES

		return {
			uuid: initialData.uuid || '',
			name: initialData.name || '',
			address: initialData.address || '',
			liquidUnit: (initialData.liquidUnit as 'L' | 'Gal') || 'L',
			weightUnit: (initialData.weightUnit as 'Kg' | 'Lb') || 'Kg',
			temperatureUnit: (initialData.temperatureUnit as '°C' | '°F') || '°C',
			billingCardUuid: initialData.billingCardUuid || '',
			status: initialData.status ?? true,
		}
	}, [initialData])

	const form = useForm<FarmFormData>({
		resolver: zodResolver(farmSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const transformToApiFormat = useCallback((data: FarmFormData): Farm => {
		return {
			uuid: data.uuid || crypto.randomUUID(),
			name: data.name,
			address: data.address,
			liquidUnit: data.liquidUnit,
			weightUnit: data.weightUnit,
			temperatureUnit: data.temperatureUnit,
			billingCardUuid: data.billingCardUuid || '',
			status: data.status ?? true,
		}
	}, [])

	const getErrorMessage = useCallback(
		(error: string): string => {
			if (error.startsWith('farm.validation.')) {
				return t(error.replace('farm.', ''))
			}
			return error
		},
		[t]
	)

	const resetWithData = useCallback(
		(data?: Partial<Farm>) => {
			if (!data) {
				form.reset(DEFAULT_VALUES)
				return
			}

			const formattedData: Partial<FarmFormData> = {
				uuid: data.uuid || '',
				name: data.name || '',
				address: data.address || '',
				liquidUnit: (data.liquidUnit as 'L' | 'Gal') || 'L',
				weightUnit: (data.weightUnit as 'Kg' | 'Lb') || 'Kg',
				temperatureUnit: (data.temperatureUnit as '°C' | '°F') || '°C',
				billingCardUuid: data.billingCardUuid || '',
				status: data.status ?? true,
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
