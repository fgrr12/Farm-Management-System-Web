import { memo, useCallback, useEffect, useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { FormLayout } from '@/components/layout/FormLayout'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import type { CustomSelectOption } from '@/components/ui/CustomSelect'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { TextField } from '@/components/ui/TextField'

import { useEmployeeForm } from '@/hooks/forms/useEmployeeForm'
import { useCreateEmployee, useEmployee, useUpdateEmployee } from '@/hooks/queries/useEmployees'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { EmployeeFormData } from '@/schemas'

const EmployeeForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['employeeForm'])
	const { setPageTitle, showToast, withError } = usePagePerformance()

	const form = useEmployeeForm()
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
		transformToApiFormat,
		getErrorMessage,
		resetWithData,
	} = form

	const { data: employee } = useEmployee(params.employeeUuid || '')

	const roleOptions: CustomSelectOption[] = useMemo(
		() => [
			{ value: 'employee', label: t('employee') },
			{ value: 'owner', label: t('owner') },
		],
		[t]
	)

	useEffect(() => {
		if (employee) {
			resetWithData(employee)
		}
	}, [employee, resetWithData])

	const createEmployee = useCreateEmployee()
	const updateEmployee = useUpdateEmployee()

	const onSubmit = useCallback(
		async (data: EmployeeFormData) => {
			if (!user || !farm) return

			await withError(async () => {
				const employeeData = transformToApiFormat(data)
				employeeData.farmUuid = farm.uuid

				if (params.employeeUuid) {
					await updateEmployee.mutateAsync({
						employee: employeeData,
						userUuid: user.uuid,
					})
					showToast(t('toast.edited'), 'success')
				} else {
					employeeData.createdBy = user.uuid
					await createEmployee.mutateAsync({
						employee: employeeData,
						userUuid: user.uuid,
					})
					showToast(t('toast.added'), 'success')
				}
				navigate(AppRoutes.EMPLOYEES)
			}, t('toast.errorAddingEmployee'))
		},
		[
			farm,
			user,
			params.employeeUuid,
			transformToApiFormat,
			createEmployee,
			updateEmployee,
			showToast,
			t,
			navigate,
			withError,
		]
	)

	useEffect(() => {
		const title = params.employeeUuid ? t('editEmployee') : t('addEmployee')
		setPageTitle(title)
	}, [setPageTitle, t, params.employeeUuid])

	const isEditing = !!params.employeeUuid

	return (
		<PageContainer maxWidth="4xl">
			<PageHeader
				icon="person-add"
				title={isEditing ? t('editEmployee') : t('addEmployee')}
				subtitle={isEditing ? t('editSubtitle') : t('addSubtitle')}
				variant="compact"
			/>

			<FormLayout
				sections={[
					{
						title: t('personalInformation'),
						icon: 'person',
						columns: 2,
						children: (
							<>
								<TextField
									{...register('name')}
									type="text"
									placeholder={t('placeholders.name')}
									label={t('name')}
									required
									error={errors.name ? getErrorMessage(errors.name.message || '') : undefined}
									autoComplete="given-name"
								/>

								<TextField
									{...register('lastName')}
									type="text"
									placeholder={t('placeholders.lastName')}
									label={t('lastName')}
									required
									error={
										errors.lastName ? getErrorMessage(errors.lastName.message || '') : undefined
									}
									autoComplete="family-name"
								/>
							</>
						),
					},
					{
						title: t('contactInformation'),
						icon: 'contact-mail',
						columns: 2,
						children: (
							<>
								<TextField
									{...register('email')}
									type="email"
									placeholder={t('placeholders.email')}
									label={t('email')}
									required
									error={errors.email ? getErrorMessage(errors.email.message || '') : undefined}
									autoComplete="email"
								/>

								<TextField
									{...register('phone')}
									type="tel"
									placeholder={t('placeholders.phone')}
									label={t('phone')}
									required
									error={errors.phone ? getErrorMessage(errors.phone.message || '') : undefined}
									autoComplete="tel"
								/>
							</>
						),
					},
					{
						title: t('roleInformation'),
						icon: 'admin-panel-settings',
						columns: 1,
						children: (
							<Controller
								name="role"
								control={control}
								render={({ field }) => (
									<CustomSelect
										label={t('selectRole')}
										placeholder={t('placeholders.role')}
										value={field.value}
										onChange={field.onChange}
										options={roleOptions}
										required
										error={errors.role ? getErrorMessage(errors.role.message || '') : undefined}
									/>
								)}
							/>
						),
					},
				]}
				onSubmit={handleSubmit(onSubmit)}
				submitButton={{
					label: isEditing ? t('editButton') : t('addButton'),
					isSubmitting,
					icon: 'save',
				}}
			/>
		</PageContainer>
	)
}

export default memo(EmployeeForm)
