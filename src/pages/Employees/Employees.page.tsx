import { type ChangeEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

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
	const { defaultModalData, setHeaderTitle, setModalData, setLoading } = useAppStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['employees'])

	const [employees, setEmployees] = useState<User[]>([])
	const [search, setSearch] = useState('')

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
			setModalData({
				open: true,
				title: t('modal.errorGettingEmployees.title'),
				message: t('modal.errorGettingEmployees.message'),
				onAccept: () => setModalData(defaultModalData),
			})
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

	useEffect(() => {
		setHeaderTitle(t('title'))
	}, [setHeaderTitle, t])
	return (
		<S.Container>
			<S.HeaderContainer>
				<Search placeholder={t('search')} value={search} onChange={handleDebounceSearch} />
				<Button onClick={handleAddEmployee}>{t('addEmployee')}</Button>
			</S.HeaderContainer>
			<EmployeesTable employees={employees} removeEmployee={handleRemoveEmployee} />
		</S.Container>
	)
}
