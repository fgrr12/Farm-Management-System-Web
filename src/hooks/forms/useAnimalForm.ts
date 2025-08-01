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
	const { t } = useTranslation(['animalForm'])

	const formatDateForForm = useCallback((dateValue: string | Date | null | undefined): string => {
		if (!dateValue) return ''

		try {
			if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
				return dateValue
			}

			const date = new Date(dateValue)
			if (Number.isNaN(date.getTime())) return ''

			return date.toISOString().split('T')[0]
		} catch {
			return ''
		}
	}, [])

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
			birthDate: formatDateForForm(initialData.birthDate),
			purchaseDate: formatDateForForm(initialData.purchaseDate),
			soldDate: formatDateForForm(initialData.soldDate),
			deathDate: formatDateForForm(initialData.deathDate),
			picture: initialData.picture || '',
			status: initialData.status ?? true,
			farmUuid: initialData.farmUuid || '',
		}
	}, [initialData, formatDateForForm])

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
			if (!data) {
				form.reset(DEFAULT_VALUES)
				return
			}

			const formattedData: Partial<AnimalFormData> = {
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

			form.reset(formattedData)
		},
		[form, formatDateForForm]
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
