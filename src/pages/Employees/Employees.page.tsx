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

import * as S from './Employees.styles'

export const Employees: FC = () => {
	const { user } = useUserStore()
	const { setLoading, setHeaderTitle } = useAppStore()
	const navigate = useNavigate()

	const [employees, setEmployees] = useState<Employee[]>([])
	const [search, setSearch] = useState('')

	const handleDebounceSearch = (event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value)
	}

	const initialData = async () => {
		try {
			setLoading(true)
			const data = await EmployeesService.getEmployees(null, user!.farmUuid!)
			setEmployees(data)
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	const getEmployees = async () => {
		const data = await EmployeesService.getEmployees(search, user!.farmUuid!)
		setEmployees(data)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		if (!user) {
			navigate('/')
			return
		}
		setHeaderTitle('Employees')
		initialData()
	}, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		const debounceId = setTimeout(() => {
			setSearch(search)
			getEmployees()
		}, 500)
		return () => clearTimeout(debounceId)
	}, [search])
	return (
		<S.Container>
			<S.HeaderContainer>
				<Search placeholder="Search employees" value={search} onChange={handleDebounceSearch} />
				<Button onClick={() => console.log('Add employee')}>Add employee</Button>
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
								<Table.Cell>{employee.name}</Table.Cell>
								<Table.Cell>{employee.role}</Table.Cell>
								<Table.Cell>{employee.phone}</Table.Cell>
								<Table.Cell>{employee.email}</Table.Cell>
								<Table.Cell>{employee.status ? 'Active' : 'Inactive'}</Table.Cell>
								<Table.Cell>
									<ActionButton title="Edit" icon="i-material-symbols-edit-square-outline" />
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
