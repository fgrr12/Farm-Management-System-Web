import { type ChangeEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { Table } from '@/components/ui/Table'

import { EmployeesService } from '@/services/employees'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import type { Employee } from './Employees.types'

import { AppRoutes } from '@/config/constants/routes'
import * as S from './Employees.styles'

export const Employees: FC = () => {
	const { user } = useUserStore()
	const { setLoading, setHeaderTitle } = useAppStore()
	const navigate = useNavigate()

	const [employees, setEmployees] = useState<Employee[]>([])
	const [search, setSearch] = useState('')

	const handleAddEmployee = () => {
		navigate(AppRoutes.ADD_EMPLOYEE)
	}

	const handleEditEmployee = (employeeUuid: string) => () => {
		const path = AppRoutes.EDIT_EMPLOYEE.replace(':employeeUuid', employeeUuid)
		navigate(path)
	}

	const handleDebounceSearch = (event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value)
	}

	const initialData = async () => {
		try {
			setLoading(true)
			const data = await EmployeesService.getEmployees(null, user!.farmUuid!)
			setEmployees(data.filter((employee) => employee.uuid !== user!.uuid))
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	const getEmployees = async () => {
		const data = await EmployeesService.getEmployees(search, user!.farmUuid!)
		setEmployees(data.filter((employee) => employee.uuid !== user!.uuid))
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		setHeaderTitle('Employees')
		if (!user) return
		if (user && user.role === 'employee') {
			navigate(AppRoutes.LOGIN)
			return
		}
		initialData()
	}, [user])

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		const debounceId = setTimeout(() => {
			if (!user) return
			getEmployees()
		}, 500)
		return () => clearTimeout(debounceId)
	}, [search])
	return (
		<S.Container>
			<S.HeaderContainer>
				<Search placeholder="Search employees" value={search} onChange={handleDebounceSearch} />
				<Button onClick={handleAddEmployee}>Add employee</Button>
			</S.HeaderContainer>
			<Table>
				<Table.Head>
					<Table.Row>
						<Table.HeadCell>Employee</Table.HeadCell>
						<Table.HeadCell>Role</Table.HeadCell>
						<Table.HeadCell>Phone</Table.HeadCell>
						<Table.HeadCell>Email</Table.HeadCell>
						<Table.HeadCell>Status</Table.HeadCell>
						<Table.HeadCell>Actions</Table.HeadCell>
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{employees &&
						employees.map((employee) => (
							<Table.Row key={employee.uuid}>
								<Table.Cell data-title="Employee">
									{employee.name} {employee.lastName}
								</Table.Cell>
								<Table.Cell data-title="Role">{employee.role}</Table.Cell>
								<Table.Cell data-title="Phone">{employee.phone}</Table.Cell>
								<Table.Cell data-title="Email">{employee.email}</Table.Cell>
								<Table.Cell data-title="Status">
									{employee.status ? 'Active' : 'Inactive'}
								</Table.Cell>
								<Table.Cell data-title="Actions">
									<ActionButton
										title="Edit"
										icon="i-material-symbols-edit-square-outline"
										onClick={handleEditEmployee(employee.uuid)}
									/>
									<ActionButton title="Delete" icon="i-material-symbols-delete-outline" />
								</Table.Cell>
							</Table.Row>
						))}
					{employees.length === 0 && (
						<Table.Row>
							<Table.Cell colSpan={6}>No employees found</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</S.Container>
	)
}
