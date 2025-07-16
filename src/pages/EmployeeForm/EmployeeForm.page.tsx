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
		await withLoadingAndError(
			async () => {
				if (!params.employeeUuid) return null

				const employeeUuid = params.employeeUuid as string
				const employeeData = await EmployeesService.getEmployee(employeeUuid)
				setEmployee(employeeData)
				return employeeData
			},
			t('toast.errorGettingEmployee')
		)
	}, [params.employeeUuid, withLoadingAndError, t])

	const handleSubmit = useCallback(async (e: FormEvent) => {
		if (!user) return

		e.preventDefault()

		await withLoadingAndError(
			async () => {
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
			},
			t('toast.errorAddingEmployee')
		)
	}, [user, employee, params.employeeUuid, withLoadingAndError, showToast, t, navigate])

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
			<form
				className="flex flex-col items-center gap-4 max-w-[400px] w-full"
				onSubmit={handleSubmit}
				autoComplete="off"
			>
				<TextField
					name="name"
					type="text"
					placeholder={t('name')}
					label={t('name')}
					value={employee.name}
					onChange={handleTextChange}
					required
				/>
				<TextField
					name="lastName"
					type="text"
					placeholder={t('lastName')}
					label={t('lastName')}
					value={employee.lastName}
					onChange={handleTextChange}
					required
				/>
				<TextField
					name="email"
					type="email"
					placeholder={t('email')}
					label={t('email')}
					value={employee.email}
					onChange={handleTextChange}
					required
				/>
				<TextField
					name="phone"
					type="tel"
					placeholder={t('phone')}
					label={t('phone')}
					value={employee.phone}
					onChange={handleTextChange}
					required
				/>
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
				/>
				<Button type="submit">{params.employeeUuid ? t('editButton') : t('addButton')}</Button>
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
