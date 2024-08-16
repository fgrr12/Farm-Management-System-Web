import { AppRoutes } from '@/config/constants/routes'
import { useNavigate } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'
import { Table } from '@/components/ui/Table'

import { EmployeesService } from '@/services/employees'
import { useAppStore } from '@/store/useAppStore'

import type { EmployeesTableProps } from './EmployeesTable.types'

import * as S from './EmployeesTable.styles'

export const EmployeesTable: FC<EmployeesTableProps> = ({ employees, user, removeEmployee }) => {
	const { defaultModalData, setModalData, setLoading } = useAppStore()
	const navigate = useNavigate()

	const handleEditEmployee = (employeeUuid: string) => () => {
		const path = AppRoutes.EDIT_EMPLOYEE.replace(':employeeUuid', employeeUuid)
		navigate(path)
	}

	const handleDeleteEmployee = (user: User) => async () => {
		setModalData({
			open: true,
			title: 'Do you want to delete this employee?',
			message: 'This action cannot be undone.',
			onAccept: async () => {
				setLoading(true)
				await EmployeesService.deleteEmployee(user.uuid)
				removeEmployee(user.uuid)
				setModalData(defaultModalData)
				setLoading(false)
			},
			onCancel: () => setModalData(defaultModalData),
		})
	}
	return (
		<S.TableContainer>
			<Table>
				<Table.Head>
					<Table.Row>
						<Table.HeadCell>Name</Table.HeadCell>
						<Table.HeadCell>Last Name</Table.HeadCell>
						<Table.HeadCell>Email</Table.HeadCell>
						<Table.HeadCell>Phone</Table.HeadCell>
						<Table.HeadCell>Role</Table.HeadCell>
						{user && <Table.HeadCell>Actions</Table.HeadCell>}
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{employees.map((employee) => (
						<Table.Row key={employee.uuid}>
							<Table.Cell>{employee.name}</Table.Cell>
							<Table.Cell>{employee.lastName}</Table.Cell>
							<Table.Cell>{employee.email}</Table.Cell>
							<Table.Cell>{employee.phone}</Table.Cell>
							<Table.Cell>{employee.role}</Table.Cell>
							{user && (
								<Table.Cell>
									<ActionButton
										title="Edit"
										icon="i-material-symbols-edit-square-outline"
										onClick={handleEditEmployee(employee.uuid)}
									/>
									<ActionButton
										title="Delete"
										icon="i-material-symbols-delete-outline"
										onClick={handleDeleteEmployee(employee)}
									/>
								</Table.Cell>
							)}
						</Table.Row>
					))}
					{employees.length === 0 && (
						<Table.Row>
							<Table.Cell colSpan={user ? 12 : 11}>No employees found</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</S.TableContainer>
	)
}
