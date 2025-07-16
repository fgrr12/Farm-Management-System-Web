import { type ChangeEvent, type FormEvent, memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useUserStore } from '@/store/useUserStore'

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'

import { EmployeesService } from '@/services/employees'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import { usePagePerformance } from '@/hooks/usePagePerformance'

import type { RegisterEmployeeForm } from './EmployeeForm.types'

const EmployeeForm = () => {
	const { user } = useUserStore()
	const navigate = useNavigate()
	const params = useParams()
	const { t } = useTranslation(['employeeForm'])
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const [employee, setEmployee] = useState(INITIAL_EMPLOYEE_DATA)

	const handleTextChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setEmployee((prev) => ({ ...prev, [name]: capitalizeFirstLetter(value) }))
	}, [])

	const handleSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setEmployee((prev) => ({ ...prev, [name]: value }))
	}, [])

	const initialData = useCallback(async () => {
		await withLoadingAndError(async () => {
			if (!params.employeeUuid) return null

			const employeeUuid = params.employeeUuid as string
			const employeeData = await EmployeesService.getEmployee(employeeUuid)
			setEmployee(employeeData)
			return employeeData
		}, t('toast.errorGettingEmployee'))
	}, [params.employeeUuid, withLoadingAndError, t])

	const handleSubmit = useCallback(
		async (e: FormEvent) => {
			if (!user) return

			e.preventDefault()

			await withLoadingAndError(async () => {
				employee.farmUuid = user.farmUuid!
				employee.uuid = employee.uuid ?? crypto.randomUUID()

				if (params.employeeUuid) {
					await EmployeesService.updateEmployee(employee)
					showToast(t('toast.edited'), 'success')
					navigate(AppRoutes.EMPLOYEES)
					return
				}

				employee.createdBy = user.uuid
				await EmployeesService.setEmployee(employee)
				showToast(t('toast.added'), 'success')
				navigate(AppRoutes.EMPLOYEES)
			}, t('toast.errorAddingEmployee'))
		},
		[user, employee, params.employeeUuid, withLoadingAndError, showToast, t, navigate]
	)

	useEffect(() => {
		if (user && params.employeeUuid) {
			initialData()
		}
	}, [user, params.employeeUuid, initialData])

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
				{t('skipToForm', 'Skip to employee form')}
			</a>

			<form
				id="employee-form"
				className="flex flex-col items-center gap-4 max-w-[400px] w-full"
				onSubmit={handleSubmit}
				autoComplete="off"
				aria-labelledby="form-heading"
				noValidate
			>
				<h2 id="form-heading" className="sr-only">
					{params.employeeUuid ? t('editEmployeeForm') : t('addEmployeeForm')}
				</h2>

				<fieldset className="contents">
					<legend className="sr-only">{t('employeeInformation', 'Employee information')}</legend>

					<TextField
						name="name"
						type="text"
						placeholder={t('name')}
						label={t('name')}
						value={employee.name}
						onChange={handleTextChange}
						required
						aria-describedby="name-help"
						autoComplete="given-name"
					/>
					<div id="name-help" className="sr-only">
						{t('nameHelp', "Enter the employee's first name")}
					</div>

					<TextField
						name="lastName"
						type="text"
						placeholder={t('lastName')}
						label={t('lastName')}
						value={employee.lastName}
						onChange={handleTextChange}
						required
						aria-describedby="lastname-help"
						autoComplete="family-name"
					/>
					<div id="lastname-help" className="sr-only">
						{t('lastNameHelp', "Enter the employee's last name")}
					</div>

					<TextField
						name="email"
						type="email"
						placeholder={t('email')}
						label={t('email')}
						value={employee.email}
						onChange={handleTextChange}
						required
						aria-describedby="email-help"
						autoComplete="email"
					/>
					<div id="email-help" className="sr-only">
						{t('emailHelp', "Enter the employee's email address")}
					</div>

					<TextField
						name="phone"
						type="tel"
						placeholder={t('phone')}
						label={t('phone')}
						value={employee.phone}
						onChange={handleTextChange}
						required
						aria-describedby="phone-help"
						autoComplete="tel"
					/>
					<div id="phone-help" className="sr-only">
						{t('phoneHelp', "Enter the employee's phone number")}
					</div>

					<Select
						name="role"
						legend={t('selectRole')}
						defaultLabel={t('selectRole')}
						value={employee.role}
						items={[
							{ value: 'employee', name: t('employee') },
							{ value: 'owner', name: t('owner') },
						]}
						onChange={handleSelectChange}
						required
						aria-describedby="role-help"
					/>
					<div id="role-help" className="sr-only">
						{t('roleHelp', "Select the employee's role and permissions level")}
					</div>
				</fieldset>

				<Button type="submit" aria-describedby="submit-help">
					{params.employeeUuid ? t('editButton') : t('addButton')}
				</Button>
				<div id="submit-help" className="sr-only">
					{params.employeeUuid
						? t('editSubmitHelp', 'Save changes to this employee')
						: t('addSubmitHelp', 'Add this new employee to your farm')}
				</div>
			</form>
		</div>
	)
}

const INITIAL_EMPLOYEE_DATA: RegisterEmployeeForm = {
	uuid: '',
	name: '',
	lastName: '',
	email: '',
	phone: '',
	role: '',
	status: true,
	farmUuid: '',
	createdBy: '',
	photoUrl: '',
	language: 'spa',
}

export default memo(EmployeeForm)
