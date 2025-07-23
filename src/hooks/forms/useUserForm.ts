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

	const getDefaultValues = useCallback((): Partial<UserFormData> => {
		if (!initialData) return DEFAULT_VALUES

		return {
			uuid: initialData.uuid || '',
			name: initialData.name || '',
			lastName: initialData.lastName || '',
			email: initialData.email || '',
			phone: initialData.phone || '',
			language: (initialData.language as 'spa' | 'eng') || 'spa',
			role: (initialData.role as Role) || 'employee',
			status: initialData.status ?? true,
			photoUrl: initialData.photoUrl || '',
			farmUuid: initialData.farmUuid || '',
		}
	}, [initialData])

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
			if (!data) {
				form.reset(DEFAULT_VALUES)
				return
			}

			const formattedData: Partial<UserFormData> = {
				uuid: data.uuid || '',
				name: data.name || '',
				lastName: data.lastName || '',
				email: data.email || '',
				phone: data.phone || '',
				language: (data.language as 'spa' | 'eng') || 'spa',
				role: (data.role as 'employee' | 'owner' | 'admin') || 'employee',
				status: data.status ?? true,
				photoUrl: data.photoUrl || '',
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
