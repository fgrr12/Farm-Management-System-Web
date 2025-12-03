import { type ChangeEvent, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'

import { EmployeesTable } from '@/components/business/Employees/EmployeesTable'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader, PageHeaderStats } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { TableSkeleton } from '@/components/ui/SkeletonLoader'

import { useDeleteEmployee, useEmployees } from '@/hooks/queries/useEmployees'
import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

const Employees = () => {
	const { farm } = useFarmStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['employees'])
	const { setPageTitle } = usePagePerformance()

	const [search, setSearch] = useState('')

	const { data: employees, isLoading } = useEmployees(farm?.uuid || '')
	const deleteEmployee = useDeleteEmployee()

	const filteredEmployees = useMemo(() => {
		if (!employees) return []
		return employees.filter(
			(employee) =>
				employee.name.toLowerCase().includes(search.toLowerCase()) ||
				employee.lastName.toLowerCase().includes(search.toLowerCase()) ||
				employee.email.toLowerCase().includes(search.toLowerCase()) ||
				employee.phone.toLowerCase().includes(search.toLowerCase())
		)
	}, [employees, search])

	const ownerCount = useMemo(() => {
		return employees?.filter((emp) => emp.role === 'owner').length || 0
	}, [employees])

	const handleAddEmployee = useCallback(() => {
		navigate(AppRoutes.ADD_EMPLOYEE)
	}, [navigate])

	const handleDebounceSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value)
	}, [])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<PageContainer>
			<a
				href="#employees-table"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
			>
				{t('accessibility.skipToEmployees')}
			</a>

			<PageHeader
				icon="group"
				title={t('title')}
				subtitle={t('subtitle')}
				stats={
					<PageHeaderStats
						stats={[
							{ value: employees?.length || 0, label: t('totalEmployees'), variant: 'info' },
							{ value: filteredEmployees.length, label: t('filteredResults'), variant: 'success' },
							{ value: ownerCount, label: t('owners') },
						]}
					/>
				}
				actions={
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

							<Button
								className="btn btn-primary h-12 px-6 flex items-center gap-2 whitespace-nowrap w-full sm:w-auto"
								onClick={handleAddEmployee}
								aria-describedby="add-employee-description"
							>
								<i className="i-material-symbols-person-add w-5! h-5!" />
								{t('addEmployee')}
							</Button>
							<div id="add-employee-description" className="sr-only">
								{t('accessibility.addEmployeeDescription')}
							</div>
						</div>
					</section>
				}
			/>

			{/* Employees Table */}
			<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-xl dark:shadow-gray-900/25 overflow-hidden">
				<section aria-labelledby="employees-heading" aria-live="polite">
					<h2 id="employees-heading" className="sr-only">
						{t('accessibility.employeesList')} ({filteredEmployees.length}{' '}
						{t('accessibility.results')})
					</h2>
					<div id="employees-table">
						{isLoading ? (
							<TableSkeleton rows={5} columns={5} />
						) : (
							<EmployeesTable
								employees={filteredEmployees}
								removeEmployee={(uuid) => async () => {
									await deleteEmployee.mutateAsync({ employeeUuid: uuid, userUuid: farm!.uuid })
								}}
								aria-label={t('accessibility.employeesTable', {
									count: filteredEmployees.length,
								})}
							/>
						)}
					</div>
				</section>
			</div>
		</PageContainer>
	)
}

export default memo(Employees)
