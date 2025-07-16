import { type ChangeEvent, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useUserStore } from '@/store/useUserStore'

import { EmployeesService } from '@/services/employees'

import { EmployeesTable } from '@/components/business/Employees/EmployeesTable'
import { Search } from '@/components/ui/Search'

import { usePagePerformance } from '@/hooks/usePagePerformance'

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
		<div className="flex flex-col gap-5 p-4 w-full h-full overflow-auto">
			<a
				href="#employees-table"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
			>
				{t('skipToEmployees', 'Skip to employees list')}
			</a>

			<header>
				<h1 className="sr-only">{t('title')}</h1>
			</header>

			<section aria-labelledby="search-heading" role="search">
				<h2 id="search-heading" className="sr-only">
					{t('searchSection', 'Search and manage employees')}
				</h2>
				<div className="flex flex-col md:grid md:grid-cols-3 items-center justify-center gap-4 w-full">
					<Search
						placeholder={t('search')}
						value={search}
						onChange={handleDebounceSearch}
						aria-label={t('searchEmployees', 'Search employees by name, email, or phone')}
						aria-describedby="search-help"
					/>
					<div id="search-help" className="sr-only">
						{t('searchHelp', 'Search by name, last name, email, or phone number')}
					</div>

					<button
						type="button"
						className="btn btn-primary h-12 w-full text-lg col-start-3"
						onClick={handleAddEmployee}
						aria-describedby="add-employee-description"
					>
						{t('addEmployee')}
					</button>
					<div id="add-employee-description" className="sr-only">
						{t('addEmployeeDescription', 'Navigate to form to add a new employee')}
					</div>
				</div>
			</section>

			<section aria-labelledby="employees-heading" aria-live="polite">
				<h2 id="employees-heading" className="sr-only">
					{t('employeesList', 'Employees list')} ({filteredEmployees.length}{' '}
					{t('results', 'results')})
				</h2>
				<div id="employees-table">
					<EmployeesTable
						employees={filteredEmployees}
						removeEmployee={handleRemoveEmployee}
						aria-label={t('employeesTable', `Table showing ${filteredEmployees.length} employees`)}
					/>
				</div>
			</section>
		</div>
	)
}

export default memo(Employees)
