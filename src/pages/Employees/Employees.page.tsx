import { type ChangeEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EmployeesCards } from '@/components/business/Employees/EmployeesCards'
import { EmployeesTable } from '@/components/business/Employees/EmployeesTable'
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'

import { AppRoutes } from '@/config/constants/routes'
import { EmployeesService } from '@/services/employees'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'

import * as S from './Employees.styles'

export const Employees: FC = () => {
	const { user } = useUserStore()
	const { setLoading, setHeaderTitle } = useAppStore()
	const navigate = useNavigate()

	const [employees, setEmployees] = useState<User[]>([])
	const [search, setSearch] = useState('')
	const [mobile, setMobile] = useState(false)

	const handleAddEmployee = () => {
		navigate(AppRoutes.ADD_EMPLOYEE)
	}

	const handleDebounceSearch = (event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value)
	}

	const handleRemoveEmployee = (employeeUuid: string) => async () => {
		setEmployees(employees.filter((employee) => employee.uuid !== employeeUuid))
	}

	const initialData = async () => {
		try {
			setLoading(true)
			const data = await EmployeesService.getEmployees(null, user!.farmUuid!)
			setEmployees(data.filter((employee) => employee.uuid !== user!.uuid))
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}

	const getEmployees = async () => {
		const data = await EmployeesService.getEmployees(search, user!.farmUuid!)
		setEmployees(data.filter((employee) => employee.uuid !== user!.uuid))
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		setMobile(window.innerWidth <= 768)
		setHeaderTitle('Employees')
		if (!user) return
		if (user && user.role === 'employee') {
			navigate(AppRoutes.LOGIN)
			return
		}
		initialData()
	}, [user])

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		const debounceId = setTimeout(() => {
			if (!user) return
			getEmployees()
		}, 500)
		return () => clearTimeout(debounceId)
	}, [search])

	//
	return (
		<S.Container>
			<S.HeaderContainer>
				<Search placeholder="Search employees" value={search} onChange={handleDebounceSearch} />
				<Button onClick={handleAddEmployee}>Add employee</Button>
			</S.HeaderContainer>
			{!mobile ? (
				<EmployeesTable employees={employees} user={user} removeEmployee={handleRemoveEmployee} />
			) : (
				<EmployeesCards employees={employees} user={user} removeEmployee={handleRemoveEmployee} />
			)}
		</S.Container>
	)
}
