import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { type EmployeeFormData, employeeSchema } from '@/schemas'

const DEFAULT_VALUES: Partial<EmployeeFormData> = {
	name: '',
	lastName: '',
	email: '',
	phone: '',
	role: 'employee',
	status: true,
	photoUrl: '',
	language: 'spa',
	createdBy: '',
}

export const useEmployeeForm = (initialData?: Partial<User>) => {
	const { t } = useTranslation(['employeeForm'])

	const getDefaultValues = useCallback((): Partial<EmployeeFormData> => {
		if (!initialData) return DEFAULT_VALUES

		return {
			uuid: initialData.uuid || '',
			name: initialData.name || '',
			lastName: initialData.lastName || '',
			email: initialData.email || '',
			phone: initialData.phone || '',
			role: (initialData.role as 'employee' | 'owner' | 'admin') || 'employee',
			status: initialData.status ?? true,
			photoUrl: initialData.photoUrl || '',
			language: initialData.language || 'spa',
			createdBy: initialData.createdBy || '',
			farmUuid: initialData.farmUuid || '',
		}
	}, [initialData])

	const form = useForm<EmployeeFormData>({
		resolver: zodResolver(employeeSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const transformToApiFormat = useCallback((data: EmployeeFormData): User => {
		return {
			uuid: data.uuid || crypto.randomUUID(),
			farmUuid: data.farmUuid || '',
			name: data.name,
			lastName: data.lastName,
			email: data.email,
			phone: data.phone,
			role: data.role,
			status: data.status ?? true,
			photoUrl: data.photoUrl || 'https://i.sstatic.net/l60Hf.png',
			language: data.language || 'spa',
			createdBy: data.createdBy || '',
		}
	}, [])

	const getErrorMessage = useCallback(
		(error: string): string => {
			if (error.startsWith('employee.validation.')) {
				return t(error.replace('employee.', ''))
			}
			return error
		},
		[t]
	)

	const resetWithData = useCallback(
		(data?: Partial<User>) => {
			if (!data) {
				form.reset(DEFAULT_VALUES)
				return
			}

			const formattedData: Partial<EmployeeFormData> = {
				uuid: data.uuid || '',
				name: data.name || '',
				lastName: data.lastName || '',
				email: data.email || '',
				phone: data.phone || '',
				role: (data.role as 'employee' | 'owner' | 'admin') || 'employee',
				status: data.status ?? true,
				photoUrl: data.photoUrl || '',
				language: data.language || 'spa',
				createdBy: data.createdBy || '',
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
