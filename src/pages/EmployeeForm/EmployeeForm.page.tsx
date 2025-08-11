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
					await EmployeesService.updateEmployee(employeeData, user.uuid)
					showToast(t('toast.edited'), 'success')
					navigate(AppRoutes.EMPLOYEES)
					return
				}

				employeeData.createdBy = user.uuid
				await EmployeesService.setEmployee(employeeData, user.uuid)
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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
			<div className="max-w-3xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				<a
					href="#employee-form"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
				>
					{t('accessibility.skipToForm')}
				</a>

				{/* Hero Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700">
					<div className="bg-gradient-to-r from-blue-600 to-green-600 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
								<i className="i-material-symbols-person-add bg-white! w-6! h-6! sm:w-8 sm:h-8" />
							</div>
							<div className="min-w-0">
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
									{params.employeeUuid ? t('editEmployee') : t('addEmployee')}
								</h1>
								<p className="text-blue-100 text-sm sm:text-base mt-1">
									{params.employeeUuid ? t('editSubtitle') : t('addSubtitle')}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Form Container */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
					<form
						id="employee-form"
						className="p-4 sm:p-6 lg:p-8"
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

						<div className="space-y-6">
							{/* Personal Information Card */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-material-symbols-person bg-blue-600! w-5! h-5!" />
									{t('personalInformation')}
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<TextField
										{...register('name')}
										type="text"
										placeholder={t('placeholders.name')}
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
										{...register('lastName')}
										type="text"
										placeholder={t('placeholders.lastName')}
										label={t('lastName')}
										required
										error={
											errors.lastName ? getErrorMessage(errors.lastName.message || '') : undefined
										}
										aria-describedby="lastName-help"
										autoComplete="family-name"
									/>
									<div id="lastName-help" className="sr-only">
										{t('accessibility.lastNameHelp')}
									</div>
								</div>
							</div>

							{/* Contact Information Card */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-material-symbols-contact-mail bg-blue-600! w-5! h-5!" />
									{t('contactInformation')}
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<TextField
										{...register('email')}
										type="email"
										placeholder={t('placeholders.email')}
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
										placeholder={t('placeholders.phone')}
										label={t('phone')}
										required
										error={errors.phone ? getErrorMessage(errors.phone.message || '') : undefined}
										aria-describedby="phone-help"
										autoComplete="tel"
									/>
									<div id="phone-help" className="sr-only">
										{t('accessibility.phoneHelp')}
									</div>
								</div>
							</div>

							{/* Role Information Card */}
							<div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
									<i className="i-material-symbols-admin-panel-settings bg-blue-600! w-5! h-5!" />
									{t('roleInformation')}
								</h3>
								<Controller
									name="role"
									control={control}
									render={({ field }) => (
										<Select
											{...field}
											legend={t('selectRole')}
											defaultLabel={t('placeholders.role')}
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
							</div>
						</div>

						{/* Submit Button */}
						<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
							<Button
								type="submit"
								disabled={isSubmitting}
								aria-describedby="submit-help"
								className="btn btn-primary h-12 w-full text-lg disabled:loading flex items-center justify-center gap-2"
							>
								{isSubmitting ? (
									<>
										<i className="i-material-symbols-hourglass-empty w-5! h-5! animate-spin" />
										{t('common:loading')}
									</>
								) : (
									<>
										<i className="i-material-symbols-save w-5! h-5!" />
										{params.employeeUuid ? t('editButton') : t('addButton')}
									</>
								)}
							</Button>
							<div id="submit-help" className="sr-only">
								{params.employeeUuid
									? t('accessibility.editSubmitHelp')
									: t('accessibility.addSubmitHelp')}
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default memo(EmployeeForm)
