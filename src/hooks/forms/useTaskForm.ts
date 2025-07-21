import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useFormTransforms } from '@/hooks/shared/useFormTransforms'

import { type TaskFormData, taskSchema } from '@/schemas'

const DEFAULT_VALUES: Partial<TaskFormData> = {
	title: '',
	description: '',
	priority: undefined,
	speciesUuid: '',
	status: 'PENDING',
}

export const useTaskForm = (initialData?: Partial<Task>) => {
	const { t } = useTranslation(['taskForm'])

	const getDefaultValues = useCallback((): Partial<TaskFormData> => {
		if (!initialData) return DEFAULT_VALUES

		return {
			uuid: initialData.uuid || '',
			title: initialData.title || '',
			description: initialData.description || '',
			priority: (initialData.priority as 'low' | 'medium' | 'high') || undefined,
			speciesUuid: initialData.speciesUuid || '',
			status: (initialData.status as 'PENDING' | 'COMPLETED') || 'PENDING',
			farmUuid: initialData.farmUuid || '',
		}
	}, [initialData])

	const form = useForm<TaskFormData>({
		resolver: zodResolver(taskSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const { register, setValue } = form

	const { registerCapitalized, registerTextareaCapitalized } = useFormTransforms(register, setValue)

	const typedRegisterCapitalized = useCallback(
		(fieldName: keyof TaskFormData) => registerCapitalized(fieldName),
		[registerCapitalized]
	)

	const typedRegisterTextareaCapitalized = useCallback(
		(fieldName: keyof TaskFormData) => registerTextareaCapitalized(fieldName),
		[registerTextareaCapitalized]
	)

	const transformToApiFormat = useCallback((data: TaskFormData): Task => {
		return {
			uuid: data.uuid || crypto.randomUUID(),
			farmUuid: data.farmUuid || '',
			title: data.title,
			description: data.description,
			priority: data.priority,
			speciesUuid: data.speciesUuid,
			status: data.status || 'PENDING',
		}
	}, [])

	const getErrorMessage = useCallback(
		(error: string): string => {
			if (error.startsWith('task.validation.')) {
				return t(error.replace('task.', ''))
			}
			return error
		},
		[t]
	)

	const resetWithData = useCallback(
		(data?: Partial<Task>) => {
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
		registerCapitalized: typedRegisterCapitalized,
		registerTextareaCapitalized: typedRegisterTextareaCapitalized,
		isValid: form.formState.isValid,
		isDirty: form.formState.isDirty,
		isSubmitting: form.formState.isSubmitting,
		errors: form.formState.errors,
	}
}
