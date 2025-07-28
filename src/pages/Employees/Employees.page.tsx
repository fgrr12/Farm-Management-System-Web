import { type ChangeEvent, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useUserStore } from '@/store/useUserStore'

import { EmployeesService } from '@/services/employees'

import { EmployeesTable } from '@/components/business/Employees/EmployeesTable'
import { Search } from '@/components/ui/Search'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const Employees = () => {
	const { user } = useUserStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['employees'])
	const { setPageTitle, withLoadingAndError } = usePagePerformance()

	const [employees, setEmployees] = useState<User[]>([])
	const [search, setSearch] = useState('')

	const filteredEmployees = useMemo(() => {
		return employees.filter(
			(employee) =>
				employee.name.toLowerCase().includes(search.toLowerCase()) ||
				employee.lastName.toLowerCase().includes(search.toLowerCase()) ||
				employee.email.toLowerCase().includes(search.toLowerCase()) ||
				employee.phone.toLowerCase().includes(search.toLowerCase())
		)
	}, [employees, search])

	const handleAddEmployee = useCallback(() => {
		navigate(AppRoutes.ADD_EMPLOYEE)
	}, [navigate])

	const handleDebounceSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value)
	}, [])

	const handleRemoveEmployee = useCallback(
		(employeeUuid: string) => async () => {
			setEmployees(employees.filter((employee) => employee.uuid !== employeeUuid))
		},
		[employees]
	)

	const initialData = useCallback(async () => {
		await withLoadingAndError(async () => {
			if (!user?.farmUuid) return []

			const data = await EmployeesService.getEmployees(user.farmUuid)
			setEmployees(data)
			return data
		}, t('toast.errorGettingEmployees'))
	}, [user?.farmUuid, withLoadingAndError, t])

	useEffect(() => {
		if (!user) return
		initialData()
	}, [user, initialData])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-y-auto">
			<div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				<a
					href="#employees-table"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
				>
					{t('accessibility.skipToEmployees')}
				</a>

				{/* Hero Header */}
				<div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 sm:mb-8">
					<div className="bg-gradient-to-r from-blue-600 to-green-600 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
								<i className="i-material-symbols-group bg-white! w-6! h-6! sm:w-8 sm:h-8" />
							</div>
							<div className="min-w-0 flex-1">
								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
									{t('title')}
								</h1>
								<p className="text-blue-100 text-sm sm:text-base mt-1">{t('subtitle')}</p>
							</div>
						</div>
					</div>

					{/* Stats Cards */}
					<div className="bg-white px-4 sm:px-6 py-4">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div className="bg-blue-50 rounded-lg p-4 text-center">
								<div className="text-2xl font-bold text-blue-600">{employees.length}</div>
								<div className="text-sm text-blue-600">{t('totalEmployees')}</div>
							</div>
							<div className="bg-green-50 rounded-lg p-4 text-center">
								<div className="text-2xl font-bold text-green-600">{filteredEmployees.length}</div>
								<div className="text-sm text-green-600">{t('filteredResults')}</div>
							</div>
							<div className="bg-purple-50 rounded-lg p-4 text-center">
								<div className="text-2xl font-bold text-purple-600">
									{employees.filter((emp) => emp.role === 'owner').length}
								</div>
								<div className="text-sm text-purple-600">{t('owners')}</div>
							</div>
						</div>
					</div>
				</div>

				{/* Search and Actions */}
				<div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
					<section aria-labelledby="search-heading" role="search">
						<h2 id="search-heading" className="sr-only">
							{t('accessibility.searchSection')}
						</h2>
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
							<div className="flex-1 w-full sm:max-w-md">
								<Search
									placeholder={t('search')}
									value={search}
									onChange={handleDebounceSearch}
									aria-label={t('accessibility.searchEmployees')}
									aria-describedby="search-help"
								/>
								<div id="search-help" className="sr-only">
									{t('accessibility.searchHelp')}
								</div>
							</div>

							<button
								type="button"
								className="btn btn-primary h-12 px-6 flex items-center gap-2 whitespace-nowrap w-full sm:w-auto"
								onClick={handleAddEmployee}
								aria-describedby="add-employee-description"
							>
								<i className="i-material-symbols-person-add w-5! h-5!" />
								{t('addEmployee')}
							</button>
							<div id="add-employee-description" className="sr-only">
								{t('accessibility.addEmployeeDescription')}
							</div>
						</div>
					</section>
				</div>

				{/* Employees Table */}
				<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
					<section aria-labelledby="employees-heading" aria-live="polite">
						<h2 id="employees-heading" className="sr-only">
							{t('accessibility.employeesList')} ({filteredEmployees.length}{' '}
							{t('accessibility.results')})
						</h2>
						<div id="employees-table">
							<EmployeesTable
								employees={filteredEmployees}
								removeEmployee={handleRemoveEmployee}
								aria-label={t('accessibility.employeesTable', { count: filteredEmployees.length })}
							/>
						</div>
					</section>
				</div>
			</div>
		</div>
	)
}

export default memo(Employees)
