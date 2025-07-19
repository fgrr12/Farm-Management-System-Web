import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'

import { EmployeesService } from '@/services/employees'

import { ActionButton } from '@/components/ui/ActionButton'

import type { EmployeesTableProps } from './EmployeesTable.types'

export const EmployeesTable: FC<EmployeesTableProps> = ({ employees, removeEmployee }) => {
	const { defaultModalData, setModalData, setLoading, setToastData } = useAppStore()
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
				try {
					setLoading(true)
					await EmployeesService.deleteEmployee(user.uuid)
					removeEmployee(user.uuid)
					setModalData(defaultModalData)
					setLoading(false)
					setToastData({
						message: t('toast.deleted'),
						type: 'success',
					})
				} catch (_error) {
					setToastData({
						message: t('toast.deleteError'),
						type: 'error',
					})
				}
			},
			onCancel: () => {
				setModalData(defaultModalData)
				setToastData({
					message: t('toast.notDeleted'),
					type: 'info',
				})
			},
		})
	}
	return (
		<div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
			<table className="table table-zebra" aria-label="Employees">
				<thead>
					<tr>
						<th>{t('name')}</th>
						<th>{t('lastName')}</th>
						<th>{t('email')}</th>
						<th>{t('phone')}</th>
						<th>{t('role')}</th>
						<th>{t('actions')}</th>
					</tr>
				</thead>
				<tbody>
					{employees.map((employee) => (
						<tr key={employee.uuid}>
							<td>{employee.name}</td>
							<td>{employee.lastName}</td>
							<td>{employee.email}</td>
							<td>{employee.phone}</td>
							<td>{t(`roleList.${employee.role.toLowerCase()}`)}</td>
							<td>
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
							</td>
						</tr>
					))}
					{employees.length === 0 && (
						<tr>
							<td colSpan={6} className="text-center font-bold">{t('noEmployees')}</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	)
}
