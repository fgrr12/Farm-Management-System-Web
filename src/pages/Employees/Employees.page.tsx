import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import { EmployeesService } from '@/services/employees'

import { EmployeesTable } from '@/components/business/Employees/EmployeesTable'
import { Search } from '@/components/ui/Search'

const Employees = () => {
	const { user } = useUserStore()
	const { setHeaderTitle, setLoading, setToastData } = useAppStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['employees'])

	const [employees, setEmployees] = useState<User[]>([])
	const [search, setSearch] = useState('')

	const filteredEmployees = useMemo(() => {
		return employees.filter((employee) =>
			employee.name.toLowerCase().includes(search.toLowerCase()) ||
			employee.lastName.toLowerCase().includes(search.toLowerCase()) ||
			employee.email.toLowerCase().includes(search.toLowerCase()) ||
			employee.phone.toLowerCase().includes(search.toLowerCase())
		)
	}, [employees, search])

	const handleAddEmployee = () => {
		navigate(AppRoutes.ADD_EMPLOYEE)
	}

	const handleDebounceSearch = (event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value)
	}

	const handleRemoveEmployee = useCallback((employeeUuid: string) => async () => {
		setEmployees(employees.filter((employee) => employee.uuid !== employeeUuid))
	}, [employees])

	const initialData = async () => {
		try {
			setLoading(true)
			const data = await EmployeesService.getEmployees(user!.farmUuid)
			setEmployees(data)
		} catch (_error) {
			setToastData({
				message: t('toast.errorGettingEmployees'),
				type: 'error',
			})
		} finally {
			setLoading(false)
		}
	}

	// biome-ignore lint:: UseEffect is only called once
	useEffect(() => {
		if (!user) return
		if (user && user.role === 'employee') {
			navigate(AppRoutes.LOGIN)
			return
		}
		initialData()
	}, [user])

	useEffect(() => {
		setHeaderTitle(t('title'))
	}, [setHeaderTitle, t])
	return (
		<div className="flex flex-col gap-5 p-4 w-full h-full overflow-auto">
			<div className="flex flex-col md:grid md:grid-cols-3 items-center justify-center gap-4 w-full">
				<Search placeholder={t('search')} value={search} onChange={handleDebounceSearch} />
				<button
					type="button"
					className="btn btn-primary h-12 w-full text-lg col-start-3"
					onClick={handleAddEmployee}
				>
					{t('addEmployee')}
				</button>
			</div>
			<EmployeesTable employees={filteredEmployees} removeEmployee={handleRemoveEmployee} />
		</div>
	)
}

export default Employees
