import { AppRoutes } from '@/config/constants/routes'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'
import { Table } from '@/components/ui/Table'

import { EmployeesService } from '@/services/employees'
import { useAppStore } from '@/store/useAppStore'

import type { EmployeesTableProps } from './EmployeesTable.types'

import * as S from './EmployeesTable.styles'

export const EmployeesTable: FC<EmployeesTableProps> = ({ employees, removeEmployee }) => {
	const { defaultModalData, setModalData, setLoading } = useAppStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['employeesData'])

	const handleEditEmployee = (employeeUuid: string) => () => {
		const path = AppRoutes.EDIT_EMPLOYEE.replace(':employeeUuid', employeeUuid)
		navigate(path)
	}

	const handleDeleteEmployee = (user: User) => async () => {
		setModalData({
			open: true,
			title: t('modal.deleteEmployee.title'),
			message: t('modal.deleteEmployee.message'),
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
						<Table.HeadCell>{t('name')}</Table.HeadCell>
						<Table.HeadCell>{t('lastName')}</Table.HeadCell>
						<Table.HeadCell>{t('email')}</Table.HeadCell>
						<Table.HeadCell>{t('phone')}</Table.HeadCell>
						<Table.HeadCell>{t('role')}</Table.HeadCell>
						<Table.HeadCell>{t('actions')}</Table.HeadCell>
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{employees.map((employee) => (
						<Table.Row key={employee.uuid}>
							<Table.Cell>{employee.name}</Table.Cell>
							<Table.Cell>{employee.lastName}</Table.Cell>
							<Table.Cell>{employee.email}</Table.Cell>
							<Table.Cell>{employee.phone}</Table.Cell>
							<Table.Cell>{t(`roleList.${employee.role.toLowerCase()}`)}</Table.Cell>
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
						</Table.Row>
					))}
					{employees.length === 0 && (
						<Table.Row>
							<Table.Cell colSpan={12}>{t('noEmployees')}</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</S.TableContainer>
	)
}
