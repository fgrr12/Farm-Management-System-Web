import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'

import { AppRoutes } from '@/config/constants/routes'
import { EmployeesService } from '@/services/employees'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import type { RegisterEmployeeForm } from './EmployeeForm.types'

import * as S from './EmployeeForm.styles'

export const EmployeeForm: FC = () => {
	const { user } = useUserStore()
	const { setHeaderTitle } = useAppStore()
	const navigate = useNavigate()
	const params = useParams()

	const [employee, setEmployee] = useState(INITIAL_EMPLOYEE_DATA)

	const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target
		setEmployee((prev) => ({ ...prev, [name]: value }))
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setEmployee((prev) => ({ ...prev, [name]: value }))
	}

	const initialData = async () => {
		try {
			const employeeUuid = params.employeeUuid as string
			const employeeData = await EmployeesService.getEmployee(employeeUuid)
			setEmployee(employeeData)
		} catch (error) {
			console.error(error)
		}
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		employee.farmUuid = user!.farmUuid!
		employee.uuid = employee.uuid ?? crypto.randomUUID()

		if (params.employeeUuid) {
			await EmployeesService.updateEmployee(employee)
			navigate(AppRoutes.EMPLOYEES)
			return
		}

		employee.createdBy = user!.uuid || ''
		await EmployeesService.setEmployee(employee)
		navigate(AppRoutes.EMPLOYEES)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		setHeaderTitle('Add Employee')
		if (!user || user.role === 'employee') {
			navigate(AppRoutes.LOGIN)
			return
		}
		if (params.employeeUuid) {
			setHeaderTitle('Edit Employee')
			initialData()
		}
	}, [])

	return (
		<S.Container>
			<S.Form onSubmit={handleSubmit} autoComplete="off">
				<TextField
					name="name"
					type="text"
					placeholder="Name"
					label="Name"
					value={employee.name}
					onChange={handleTextChange}
					required
				/>
				<TextField
					name="lastName"
					type="text"
					placeholder="Last Name"
					label="Last Name"
					value={employee.lastName}
					onChange={handleTextChange}
					required
				/>
				<TextField
					name="email"
					type="email"
					placeholder="Email"
					label="Email"
					value={employee.email}
					onChange={handleTextChange}
					required
				/>
				<TextField
					name="phone"
					type="tel"
					placeholder="Phone"
					label="Phone"
					value={employee.phone}
					onChange={handleTextChange}
					required
				/>
				<Select
					name="role"
					label="Role"
					value={employee.role}
					onChange={handleSelectChange}
					required
				>
					<option value="employee">Employee</option>
					<option value="owner">Owner</option>
				</Select>
				<Button type="submit">Register Employee</Button>
			</S.Form>
		</S.Container>
	)
}

const INITIAL_EMPLOYEE_DATA: RegisterEmployeeForm = {
	uuid: '',
	name: '',
	lastName: '',
	email: '',
	phone: '',
	role: 'employee',
	status: true,
	farmUuid: '',
	createdBy: '',
}
