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
	language: 'eng',
	status: true,
}

export const useFarmForm = (initialData?: Partial<Farm>) => {
	const { t } = useTranslation(['myAccount'])

	const mapToFormData = useCallback((data: Partial<Farm>): Partial<FarmFormData> => {
		return {
			uuid: data.uuid || '',
			name: data.name || '',
			address: data.address || '',
			liquidUnit: (data.liquidUnit as 'L' | 'Gal') || 'L',
			weightUnit: (data.weightUnit as 'Kg' | 'P') || 'Kg',
			temperatureUnit: (data.temperatureUnit as '°C' | '°F') || '°C',
			language: (data.language as 'eng' | 'spa') || 'eng',
			taxDetailsUuid: data.taxDetailsUuid || '',
			status: data.status ?? true,
		}
	}, [])

	const getDefaultValues = useCallback((): Partial<FarmFormData> => {
		if (!initialData) return DEFAULT_VALUES
		return mapToFormData(initialData)
	}, [initialData, mapToFormData])

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
			language: data.language,
			taxDetailsUuid: data.taxDetailsUuid || '',
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
