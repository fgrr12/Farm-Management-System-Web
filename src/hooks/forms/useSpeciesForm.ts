import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { type SpeciesFormData, speciesSchema } from '@/schemas'

const DEFAULT_VALUES: Partial<SpeciesFormData> = {
	name: '',
}

export const useSpeciesForm = (initialData?: Partial<Species>) => {
	const { t } = useTranslation(['mySpecies'])

	const getDefaultValues = useCallback((): Partial<SpeciesFormData> => {
		if (!initialData) return DEFAULT_VALUES

		return {
			uuid: initialData.uuid || '',
			name: initialData.name || '',
			farmUuid: initialData.farmUuid || '',
		}
	}, [initialData])

	const form = useForm<SpeciesFormData>({
		resolver: zodResolver(speciesSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const transformToApiFormat = useCallback((data: SpeciesFormData): Species => {
		return {
			uuid: data.uuid || crypto.randomUUID(),
			name: data.name,
			farmUuid: data.farmUuid || '',
		}
	}, [])

	const getErrorMessage = useCallback(
		(error: string): string => {
			if (error.startsWith('species.validation.')) {
				return t(error.replace('species.', ''))
			}
			return error
		},
		[t]
	)

	const resetWithData = useCallback(
		(data?: Partial<Species>) => {
			if (!data) {
				form.reset(DEFAULT_VALUES)
				return
			}

			const formattedData: Partial<SpeciesFormData> = {
				uuid: data.uuid || '',
				name: data.name || '',
				farmUuid: data.farmUuid || '',
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
