import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

export function useRouteTitle(): string {
	const { pathname } = useLocation()
	const { t } = useTranslation()

	if (pathname.includes('/add-health-record'))
		return t('addHealthRecordTitle', { ns: 'healthRecordForm' })
	if (pathname.includes('/edit-health-record'))
		return t('editHealthRecordTitle', { ns: 'healthRecordForm' })
	if (pathname.includes('/add-production-record'))
		return t('addProductionRecordTitle', { ns: 'productionRecordForm' })
	if (pathname.includes('/edit-production-record'))
		return t('editProductionRecordTitle', { ns: 'productionRecordForm' })
	if (pathname.includes('/related-animals')) return t('title', { ns: 'relatedAnimals' })
	if (pathname.includes('/add-animal')) return t('addAnimal', { ns: 'animalForm' })
	if (pathname.includes('/edit-animal')) return t('editAnimal', { ns: 'animalForm' })
	if (pathname.includes('/add-employee')) return t('addEmployee', { ns: 'employeeForm' })
	if (pathname.match(/\/employees\/.+\/edit-employee/))
		return t('editEmployee', { ns: 'employeeForm' })
	if (pathname.includes('/add-task')) return t('title', { ns: 'taskForm' })
	if (pathname === AppRoutes.ANIMALS) return t('title', { ns: 'animals' })
	if (pathname === AppRoutes.EMPLOYEES) return t('title', { ns: 'employees' })
	if (pathname === AppRoutes.MY_ACCOUNT) return t('title', { ns: 'myAccount' })
	if (pathname === AppRoutes.MY_SPECIES) return t('title', { ns: 'mySpecies' })
	if (pathname === AppRoutes.TASKS) return t('title', { ns: 'tasks' })
	if (pathname === AppRoutes.TAX_DETAILS) return t('title', { ns: 'taxDetails' })
	if (pathname === AppRoutes.DASHBOARD) return t('title', { ns: 'dashboard' })
	if (pathname === AppRoutes.CALENDAR) return t('title', { ns: 'calendar' })
	if (pathname === AppRoutes.VOICE) return t('title', { ns: 'voice' })

	return ''
}
