import { zodResolver } from '@hookform/resolvers/zod'
import type { ChangeEvent } from 'react'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'

import { type EmployeeFormData, employeeSchema } from '@/schemas'

const DEFAULT_VALUES: Partial<EmployeeFormData> = {
	name: '',
	lastName: '',
	email: '',
	phone: '',
	role: undefined,
	status: true,
	photoUrl: '',
	language: 'spa',
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
			role: (initialData.role as 'employee' | 'owner' | 'admin') || undefined,
			status: initialData.status ?? true,
			photoUrl: initialData.photoUrl || '',
			language: initialData.language || 'spa',
			farmUuid: initialData.farmUuid || '',
			createdBy: initialData.createdBy || '',
		}
	}, [initialData])

	const form = useForm<EmployeeFormData>({
		resolver: zodResolver(employeeSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const { register, setValue } = form

	const registerWithTransform = useCallback(
		(fieldName: keyof EmployeeFormData, transform?: (value: string) => any) => {
			const baseRegister = register(fieldName)

			if (!transform) return baseRegister

			return {
				...baseRegister,
				onChange: (e: ChangeEvent<HTMLInputElement>) => {
					const transformedValue = transform(e.target.value)
					setValue(fieldName, transformedValue)
				},
			}
		},
		[register, setValue]
	)

	// Helpers específicos para transformaciones comunes
	const registerCapitalized = useCallback(
		(fieldName: keyof EmployeeFormData) => registerWithTransform(fieldName, capitalizeFirstLetter),
		[registerWithTransform]
	)

	const registerNumber = useCallback(
		(fieldName: keyof EmployeeFormData) =>
			registerWithTransform(fieldName, (val) => {
				const num = Number.parseFloat(val)
				return Number.isNaN(num) ? undefined : num
			}),
		[registerWithTransform]
	)

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
			photoUrl: data.photoUrl || '',
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
				role: (data.role as 'employee' | 'owner' | 'admin') || undefined,
				status: data.status ?? true,
				photoUrl: data.photoUrl || '',
				language: data.language || 'spa',
				farmUuid: data.farmUuid || '',
				createdBy: data.createdBy || '',
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
		registerWithTransform,
		registerCapitalized,
		registerNumber,
		isValid: form.formState.isValid,
		isDirty: form.formState.isDirty,
		isSubmitting: form.formState.isSubmitting,
		errors: form.formState.errors,
	}
}
