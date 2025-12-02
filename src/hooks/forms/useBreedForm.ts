import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { type BreedFormData, breedSchema } from '@/schemas'

const DEFAULT_VALUES: Partial<BreedFormData> = {
	name: '',
	gestationPeriod: 0,
}

export const useBreedForm = (initialData?: Partial<Breed>) => {
	const { t } = useTranslation(['mySpecies'])

	const mapToFormData = useCallback((data: Partial<Breed>): Partial<BreedFormData> => {
		return {
			uuid: data.uuid || '',
			name: data.name || '',
			gestationPeriod: data.gestationPeriod || 0,
			speciesUuid: data.speciesUuid || '',
			farmUuid: data.farmUuid || '',
		}
	}, [])

	const getDefaultValues = useCallback((): Partial<BreedFormData> => {
		if (!initialData) return DEFAULT_VALUES
		return mapToFormData(initialData)
	}, [initialData, mapToFormData])

	const form = useForm<BreedFormData>({
		resolver: zodResolver(breedSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const transformToApiFormat = useCallback((data: BreedFormData): Breed => {
		return {
			uuid: data.uuid || crypto.randomUUID(),
			name: data.name,
			gestationPeriod: data.gestationPeriod,
			speciesUuid: data.speciesUuid || '',
			farmUuid: data.farmUuid || '',
		}
	}, [])

	const getErrorMessage = useCallback(
		(error: string): string => {
			if (error.startsWith('breed.validation.')) {
				return t(error.replace('breed.', ''))
			}
			return error
		},
		[t]
	)

	const resetWithData = useCallback(
		(data?: Partial<Breed>) => {
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
