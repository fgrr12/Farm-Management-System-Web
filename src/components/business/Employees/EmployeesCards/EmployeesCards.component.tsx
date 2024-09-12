import { AppRoutes } from '@/config/constants/routes'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ActionButton } from '@/components/ui/ActionButton'

import { EmployeesService } from '@/services/employees'
import { useAppStore } from '@/store/useAppStore'

import type { EmployeesCardsProps } from './EmployeesCards.types'

import * as S from './EmployeesCards.styles'

export const EmployeesCards: FC<EmployeesCardsProps> = ({ employees, removeEmployee }) => {
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
			{employees.map((employee) => (
				<S.Card key={employee.uuid}>
					<S.CardTitle>
						{employee.name} {employee.lastName}
					</S.CardTitle>
					<S.CardContent>
						<div>
							<S.CardLabel>{t('email')}</S.CardLabel>
							<S.CardValue>{employee.email}</S.CardValue>
						</div>
						<div>
							<S.CardLabel>{t('phone')}</S.CardLabel>
							<S.CardValue>{employee.phone}</S.CardValue>
						</div>
						<div>
							<S.CardLabel>{t('role')}</S.CardLabel>
							<S.CardValue>{t(`roleList.${employee.role.toLowerCase()}`)}</S.CardValue>
						</div>
					</S.CardContent>
					<S.CardActions>
						<ActionButton
							title="Edit"
							icon="i-material-symbols-edit"
							onClick={handleEditEmployee(employee.uuid)}
						/>
						<ActionButton
							title="Delete"
							icon="i-material-symbols-delete-outline"
							onClick={handleDeleteEmployee(employee)}
						/>
					</S.CardActions>
				</S.Card>
			))}
			{employees.length === 0 && (
				<S.Card>
					<S.CardTitle>{t('noEmployees')}</S.CardTitle>
				</S.Card>
			)}
		</S.TableContainer>
	)
}
