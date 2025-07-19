import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { type AnimalFormData, animalSchemaWithRefinements } from '@/schemas'

const DEFAULT_VALUES: Partial<AnimalFormData> = {
	animalId: '',
	gender: undefined,
	speciesUuid: '',
	breedUuid: '',
	color: '',
	weight: undefined,
	origin: '',
	birthDate: '',
	purchaseDate: '',
	soldDate: '',
	deathDate: '',
	picture: '',
	status: true,
}

export const useAnimalForm = (initialData?: Partial<Animal>) => {
	const { t } = useTranslation(['animal'])

	const getDefaultValues = useCallback((): Partial<AnimalFormData> => {
		if (!initialData) return DEFAULT_VALUES

		return {
			uuid: initialData.uuid || '',
			animalId: initialData.animalId || '',
			gender: (initialData.gender as 'Male' | 'Female') || undefined,
			speciesUuid: initialData.speciesUuid || '',
			breedUuid: initialData.breedUuid || '',
			color: initialData.color || '',
			weight: initialData.weight || undefined,
			origin: initialData.origin || '',
			birthDate: initialData.birthDate || '',
			purchaseDate: initialData.purchaseDate || '',
			soldDate: initialData.soldDate || '',
			deathDate: initialData.deathDate || '',
			picture: initialData.picture || '',
			status: initialData.status ?? true,
			farmUuid: initialData.farmUuid || '',
		}
	}, [initialData])

	const form = useForm<AnimalFormData>({
		resolver: zodResolver(animalSchemaWithRefinements),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const transformToApiFormat = useCallback((data: AnimalFormData): Animal => {
		return {
			uuid: data.uuid || crypto.randomUUID(),
			farmUuid: data.farmUuid || '',
			speciesUuid: data.speciesUuid,
			breedUuid: data.breedUuid,
			animalId: data.animalId,
			gender: data.gender,
			color: data.color || '',
			weight: data.weight || 0,
			status: data.status ?? true,
			origin: data.origin || '',
			picture: data.picture || '',
			birthDate: data.birthDate || '',
			purchaseDate: data.purchaseDate || '',
			soldDate: data.soldDate || '',
			deathDate: data.deathDate || '',
		}
	}, [])

	const getErrorMessage = useCallback(
		(error: string): string => {
			if (error.startsWith('animal.validation.')) {
				return t(error)
			}
			return error
		},
		[t]
	)

	const resetWithData = useCallback(
		(data?: Partial<Animal>) => {
			const newDefaults = data ? getDefaultValues() : DEFAULT_VALUES
			form.reset(newDefaults)
		},
		[form, getDefaultValues]
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
