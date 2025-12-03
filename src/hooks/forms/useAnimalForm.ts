import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { formatDateForForm } from '@/utils/date'

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
	const { t } = useTranslation(['animalForm'])

	const mapToFormData = useCallback((data: Partial<Animal>): Partial<AnimalFormData> => {
		return {
			uuid: data.uuid || '',
			animalId: data.animalId || '',
			gender: (data.gender as 'Male' | 'Female') || undefined,
			speciesUuid: data.speciesUuid || '',
			breedUuid: data.breedUuid || '',
			color: data.color || '',
			weight: data.weight || undefined,
			origin: data.origin || '',
			birthDate: formatDateForForm(data.birthDate),
			purchaseDate: formatDateForForm(data.purchaseDate),
			soldDate: formatDateForForm(data.soldDate),
			deathDate: formatDateForForm(data.deathDate),
			picture: data.picture || '',
			status: data.status ?? true,
			farmUuid: data.farmUuid || '',
		}
	}, [])

	const getDefaultValues = useCallback((): Partial<AnimalFormData> => {
		if (!initialData) return DEFAULT_VALUES
		return mapToFormData(initialData)
	}, [initialData, mapToFormData])

	const form = useForm<AnimalFormData>({
		resolver: zodResolver(animalSchemaWithRefinements),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const transformToApiFormat = useCallback((data: AnimalFormData): Animal => {
		return {
			uuid: data.uuid || self.crypto.randomUUID(),
			farmUuid: data.farmUuid || '',
			speciesUuid: data.speciesUuid,
			breedUuid: data.breedUuid,
			animalId: data.animalId,
			gender: data.gender,
			color: data.color || '',
			weight: data.weight || 0,
			status: data.status ?? true,
			origin: data.origin || '',
			healthStatus: data.healthStatus || 'unknown',
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
				return t(error.replace('animal.', ''))
			}
			return error
		},
		[t]
	)

	const resetWithData = useCallback(
		(data?: Partial<Animal>) => {
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
