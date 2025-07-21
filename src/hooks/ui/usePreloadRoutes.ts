import { useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

/**
 * Hook to preload related routes based on current route
 * Improves performance by preloading components the user will likely visit
 */
export const usePreloadRoutes = () => {
	const location = useLocation()

	const preloadRoute = useCallback((routeImport: () => Promise<any>) => {
		setTimeout(() => {
			routeImport().catch(() => {})
		}, 100)
	}, [])

	useEffect(() => {
		const currentPath = location.pathname

		switch (true) {
			case currentPath === AppRoutes.ANIMALS:
				preloadRoute(() => import('@/pages/Animal/Animal.page'))
				preloadRoute(() => import('@/pages/AnimalForm/AnimalForm.page'))
				break

			case currentPath.includes('/animal/'):
				preloadRoute(() => import('@/pages/HealthRecordForm/HealthRecordForm.page'))
				preloadRoute(() => import('@/pages/ProductionRecordForm/ProductionRecordForm.page'))
				preloadRoute(() => import('@/pages/RelatedAnimalsForm/RelatedAnimalsForm.page'))
				break

			case currentPath === AppRoutes.EMPLOYEES:
				preloadRoute(() => import('@/pages/EmployeeForm/EmployeeForm.page'))
				break

			case currentPath === AppRoutes.TASKS:
				preloadRoute(() => import('@/pages/TaskForm/TaskForm.page'))
				break

			case currentPath === AppRoutes.LOGIN:
				preloadRoute(() => import('@/pages/Animals/Animals.page'))
				break

			default:
				break
		}
	}, [location.pathname, preloadRoute])
}
