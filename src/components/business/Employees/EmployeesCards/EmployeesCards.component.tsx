import { AppRoutes } from '@/config/constants/routes'
import { useNavigate } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'

import { EmployeesService } from '@/services/employees'
import { useAppStore } from '@/store/useAppStore'

import type { EmployeesCardsProps } from './EmployeesCards.types'

import * as S from './EmployeesCards.styles'

export const EmployeesCards: FC<EmployeesCardsProps> = ({ employees, user, removeEmployee }) => {
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
			{employees.map((employee) => (
				<S.Card key={employee.uuid}>
					<S.CardTitle>{employee.name}</S.CardTitle>
					<S.CardContent>
						<div>
							<S.CardLabel>Last Name</S.CardLabel>
							<S.CardValue>{employee.lastName}</S.CardValue>
						</div>
						<div>
							<S.CardLabel>Email</S.CardLabel>
							<S.CardValue>{employee.email}</S.CardValue>
						</div>
						<div>
							<S.CardLabel>Phone</S.CardLabel>
							<S.CardValue>{employee.phone}</S.CardValue>
						</div>
						<div>
							<S.CardLabel>Role</S.CardLabel>
							<S.CardValue>{employee.role}</S.CardValue>
						</div>
					</S.CardContent>
					{user && (
						<S.CardActions>
							<ActionButton
								title="Edit"
								icon="i-material-symbols-edit"
								onClick={handleEditEmployee(employee.uuid)}
							/>
							<ActionButton
								title="Delete"
								icon="i-material-symbols-delete"
								onClick={handleDeleteEmployee(employee)}
							/>
						</S.CardActions>
					)}
				</S.Card>
			))}
			{employees.length === 0 && (
				<S.Card>
					<S.CardTitle>No production records</S.CardTitle>
				</S.Card>
			)}
		</S.TableContainer>
	)
}
