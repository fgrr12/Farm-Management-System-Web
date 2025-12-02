import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { type TaskFormData, taskSchema } from '@/schemas'

const DEFAULT_VALUES: Partial<TaskFormData> = {
	title: '',
	description: '',
	priority: undefined,
	speciesUuid: '',
	status: 'todo',
	dueDate: '',
	assignedTo: '',
}

export const useTaskForm = (initialData?: Partial<Task>) => {
	const { t } = useTranslation(['taskForm'])

	const mapToFormData = useCallback((data: Partial<Task>): Partial<TaskFormData> => {
		return {
			uuid: data.uuid || '',
			title: data.title || '',
			description: data.description || '',
			priority: data.priority || undefined,
			speciesUuid: data.speciesUuid || '',
			status: (data.status === 'overdue' ? 'todo' : data.status) || 'todo',
			farmUuid: data.farmUuid || '',
			dueDate: data.dueDate || '',
			assignedTo: data.assignedTo || '',
		}
	}, [])

	const getDefaultValues = useCallback((): Partial<TaskFormData> => {
		if (!initialData) return DEFAULT_VALUES
		return mapToFormData(initialData)
	}, [initialData, mapToFormData])

	const form = useForm<TaskFormData>({
		resolver: zodResolver(taskSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const transformToApiFormat = useCallback((data: TaskFormData): Task => {
		return {
			uuid: data.uuid || crypto.randomUUID(),
			farmUuid: data.farmUuid || '',
			title: data.title,
			description: data.description,
			priority: data.priority,
			speciesUuid: data.speciesUuid,
			status: data.status || 'todo',
			dueDate: data.dueDate || undefined,
			assignedTo: data.assignedTo || undefined,
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
