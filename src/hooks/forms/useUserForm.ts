import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { type UserFormData, userSchema } from '@/schemas'

const DEFAULT_VALUES: Partial<UserFormData> = {
	name: '',
	lastName: '',
	email: '',
	phone: '',
	language: 'spa',
	status: true,
	photoUrl: '',
}

export const useUserForm = (initialData?: Partial<User>) => {
	const { t } = useTranslation(['myAccount'])

	const mapToFormData = useCallback((data: Partial<User>): Partial<UserFormData> => {
		return {
			uuid: data.uuid || '',
			name: data.name || '',
			lastName: data.lastName || '',
			email: data.email || '',
			phone: data.phone || '',
			language: (data.language as 'spa' | 'eng') || 'spa',
			role: (data.role as Role) || 'employee',
			status: data.status ?? true,
			photoUrl: data.photoUrl || '',
			farmUuid: data.farmUuid || '',
		}
	}, [])

	const getDefaultValues = useCallback((): Partial<UserFormData> => {
		if (!initialData) return DEFAULT_VALUES
		return mapToFormData(initialData)
	}, [initialData, mapToFormData])

	const form = useForm<UserFormData>({
		resolver: zodResolver(userSchema),
		defaultValues: getDefaultValues(),
		mode: 'onChange',
		reValidateMode: 'onChange',
	})

	const transformToApiFormat = useCallback((data: UserFormData): User => {
		return {
			uuid: data.uuid || crypto.randomUUID(),
			name: data.name,
			lastName: data.lastName,
			email: data.email,
			phone: data.phone,
			language: data.language,
			role: data.role || 'employee',
			status: data.status ?? true,
			photoUrl: data.photoUrl || '',
			farmUuid: data.farmUuid || '',
		}
	}, [])

	const getErrorMessage = useCallback(
		(error: string): string => {
			if (error.startsWith('user.validation.')) {
				return t(error.replace('user.', ''))
			}
			return error
		},
		[t]
	)

	const resetWithData = useCallback(
		(data?: Partial<User>) => {
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
