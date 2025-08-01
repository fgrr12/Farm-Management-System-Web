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
	if (employees.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 px-4">
				<div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
					<i className="i-material-symbols-group w-8! h-8! text-gray-500 dark:text-gray-400" />
				</div>
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
					{t('noEmployeesTitle')}
				</h3>
				<p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
					{t('noEmployeesMessage')}
				</p>
			</div>
		)
	}

	return (
		<div className="overflow-hidden">
			{/* Desktop Table */}
			<div className="hidden md:block overflow-x-auto">
				<table className="w-full" aria-label="Employees">
					<thead>
						<tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
							<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
								<div className="flex items-center gap-2">
									<i className="i-material-symbols-person w-4! h-4!" />
									{t('employee')}
								</div>
							</th>
							<th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								<div className="flex items-center gap-2">
									<i className="i-material-symbols-contact-mail w-4! h-4!" />
									{t('contact')}
								</div>
							</th>
							<th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								<div className="flex items-center gap-2">
									<i className="i-material-symbols-admin-panel-settings w-4! h-4!" />
									{t('role')}
								</div>
							</th>
							<th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								{t('actions')}
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{employees.map((employee, index) => (
							<tr
								key={employee.uuid}
								className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
							>
								{/* Employee Info */}
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="flex items-center">
										<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
											{employee.name.charAt(0)}
											{employee.lastName.charAt(0)}
										</div>
										<div className="ml-4">
											<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
												{employee.name} {employee.lastName}
											</div>
											<div className="text-sm text-gray-600 dark:text-gray-400">
												{t('employeeNumber', { number: index + 1 })}
											</div>
										</div>
									</div>
								</td>

								{/* Contact Info */}
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="space-y-1">
										<div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
											<i className="i-material-symbols-mail w-4! h-4! text-gray-500 dark:text-gray-400 mr-2" />

											<a
												href={`mailto:${employee.email}`}
												className="hover:text-blue-600 transition-colors"
											>
												{employee.email}
											</a>
										</div>
										<div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
											<i className="i-material-symbols-phone w-4! h-4! text-gray-500 dark:text-gray-400 mr-2" />

											<a
												href={`tel:${employee.phone}`}
												className="hover:text-blue-600 transition-colors"
											>
												{employee.phone}
											</a>
										</div>
									</div>
								</td>

								{/* Role */}
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
											employee.role.toLowerCase() === 'owner'
												? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
												: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
										}`}
									>
										<i
											className={`w-3! h-3! mr-1 ${
												employee.role.toLowerCase() === 'owner'
													? 'i-material-symbols-crown'
													: 'i-material-symbols-person'
											}`}
										/>
										{t(`roleList.${employee.role.toLowerCase()}`)}
									</span>
								</td>

								{/* Actions */}
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<div className="flex items-center justify-end gap-2">
										<ActionButton
											title={t('editEmployee')}
											icon="i-material-symbols-edit-square-outline"
											onClick={handleEditEmployee(employee.uuid)}
										/>
										<ActionButton
											title={t('deleteEmployee')}
											icon="i-material-symbols-delete-outline"
											onClick={handleDeleteEmployee(employee)}
										/>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{/* Mobile Cards */}
			<div className="md:hidden space-y-4 p-4">
				{employees.map((employee, index) => (
					<div
						key={employee.uuid}
						className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
					>
						{/* Employee Header */}
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center">
								<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
									{employee.name.charAt(0)}
									{employee.lastName.charAt(0)}
								</div>
								<div className="ml-3">
									<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{employee.name} {employee.lastName}
									</h3>
									<p className="text-xs text-gray-600 dark:text-gray-400">
										{t('employeeNumber', { number: index + 1 })}
									</p>
								</div>
							</div>
							<span
								className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
									employee.role.toLowerCase() === 'owner'
										? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
										: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
								}`}
							>
								<i
									className={`w-3! h-3! mr-1 ${
										employee.role.toLowerCase() === 'owner'
											? 'i-material-symbols-crown'
											: 'i-material-symbols-person'
									}`}
								/>
								{t(`roleList.${employee.role.toLowerCase()}`)}
							</span>
						</div>

						{/* Contact Info */}
						<div className="space-y-2 mb-4">
							<div className="flex items-center text-sm text-gray-800 dark:text-gray-200">
								<i className="i-material-symbols-mail w-4! h-4! text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />

								<a
									href={`mailto:${employee.email}`}
									className="hover:text-blue-600 transition-colors truncate"
								>
									{employee.email}
								</a>
							</div>
							<div className="flex items-center text-sm text-gray-800 dark:text-gray-200">
								<i className="i-material-symbols-phone w-4! h-4! text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
								<a href={`tel:${employee.phone}`} className="hover:text-blue-600 transition-colors">
									{employee.phone}
								</a>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
							<ActionButton
								title={t('editEmployee')}
								icon="i-material-symbols-edit-square-outline"
								onClick={handleEditEmployee(employee.uuid)}
							/>
							<ActionButton
								title={t('deleteEmployee')}
								icon="i-material-symbols-delete-outline"
								onClick={handleDeleteEmployee(employee)}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
