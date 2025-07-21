import { memo, useCallback, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useUserStore } from '@/store/useUserStore'

import { EmployeesService } from '@/services/employees'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import { useEmployeeForm } from '@/hooks/forms/useEmployeeForm'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { EmployeeFormData } from '@/schemas'

const EmployeeForm = () => {
	const { user } = useUserStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['employeeForm'])
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const form = useEmployeeForm()
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
		transformToApiFormat,
		getErrorMessage,
		resetWithData,
		registerCapitalized,
	} = form

	const getEmployee = useCallback(async () => {
		await withLoadingAndError(async () => {
			if (!params.employeeUuid) return null

			const employeeUuid = params.employeeUuid as string
			const employeeData = await EmployeesService.getEmployee(employeeUuid)
			resetWithData(employeeData)
			return employeeData
		}, t('toast.errorGettingEmployee'))
	}, [params.employeeUuid, withLoadingAndError, t, resetWithData])

	const onSubmit = useCallback(
		async (data: EmployeeFormData) => {
			if (!user) return

			await withLoadingAndError(async () => {
				const employeeData = transformToApiFormat(data)
				employeeData.farmUuid = user.farmUuid!
				employeeData.uuid = employeeData.uuid || crypto.randomUUID()

				if (params.employeeUuid) {
					await EmployeesService.updateEmployee(employeeData)
					showToast(t('toast.edited'), 'success')
					navigate(AppRoutes.EMPLOYEES)
					return
				}

				employeeData.createdBy = user.uuid
				await EmployeesService.setEmployee(employeeData)
				showToast(t('toast.added'), 'success')
				navigate(AppRoutes.EMPLOYEES)
			}, t('toast.errorAddingEmployee'))
		},
		[user, params.employeeUuid, transformToApiFormat, withLoadingAndError, showToast, t, navigate]
	)

	useEffect(() => {
		if (user && params.employeeUuid) {
			getEmployee()
		}
	}, [user, params.employeeUuid, getEmployee])

	useEffect(() => {
		const title = params.employeeUuid ? t('editEmployee') : t('addEmployee')
		setPageTitle(title)
	}, [setPageTitle, t, params.employeeUuid])

	return (
		<div className="flex flex-col justify-center items-center w-full overflow-auto p-5">
			<a
				href="#employee-form"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
			>
				{t('accessibility.skipToForm')}
			</a>

			<form
				id="employee-form"
				className="flex flex-col items-center gap-4 max-w-[400px] w-full"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
				aria-labelledby="form-heading"
				noValidate
			>
				<h2 id="form-heading" className="sr-only">
					{params.employeeUuid
						? t('accessibility.editEmployeeForm')
						: t('accessibility.addEmployeeForm')}
				</h2>

				<fieldset className="contents">
					<legend className="sr-only">{t('accessibility.employeeInformation')}</legend>

					<TextField
						{...registerCapitalized('name')}
						type="text"
						placeholder={t('name')}
						label={t('name')}
						required
						error={errors.name ? getErrorMessage(errors.name.message || '') : undefined}
						aria-describedby="name-help"
						autoComplete="given-name"
					/>
					<div id="name-help" className="sr-only">
						{t('accessibility.nameHelp')}
					</div>

					<TextField
						{...registerCapitalized('lastName')}
						type="text"
						placeholder={t('lastName')}
						label={t('lastName')}
						required
						error={errors.lastName ? getErrorMessage(errors.lastName.message || '') : undefined}
						aria-describedby="lastName-help"
						autoComplete="family-name"
					/>
					<div id="lastName-help" className="sr-only">
						{t('accessibility.lastNameHelp')}
					</div>

					<TextField
						{...register('email')}
						type="email"
						placeholder={t('email')}
						label={t('email')}
						required
						error={errors.email ? getErrorMessage(errors.email.message || '') : undefined}
						aria-describedby="email-help"
						autoComplete="email"
					/>
					<div id="email-help" className="sr-only">
						{t('accessibility.emailHelp')}
					</div>

					<TextField
						{...register('phone')}
						type="tel"
						placeholder={t('phone')}
						label={t('phone')}
						required
						error={errors.phone ? getErrorMessage(errors.phone.message || '') : undefined}
						aria-describedby="phone-help"
						autoComplete="tel"
					/>
					<div id="phone-help" className="sr-only">
						{t('accessibility.phoneHelp')}
					</div>

					<Controller
						name="role"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								legend={t('selectRole')}
								defaultLabel={t('selectRole')}
								items={[
									{ value: 'employee', name: t('employee') },
									{ value: 'owner', name: t('owner') },
								]}
								required
								error={errors.role ? getErrorMessage(errors.role.message || '') : undefined}
								aria-describedby="role-help"
							/>
						)}
					/>
					<div id="role-help" className="sr-only">
						{t('accessibility.roleHelp')}
					</div>
				</fieldset>

				<Button type="submit" disabled={isSubmitting} aria-describedby="submit-help">
					{isSubmitting
						? t('common:loading')
						: params.employeeUuid
							? t('editButton')
							: t('addButton')}
				</Button>
				<div id="submit-help" className="sr-only">
					{params.employeeUuid
						? t('accessibility.editSubmitHelp')
						: t('accessibility.addSubmitHelp')}
				</div>
			</form>
		</div>
	)
}

export default memo(EmployeeForm)
