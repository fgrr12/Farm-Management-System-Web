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
		// Preload after a small delay to avoid blocking the main thread
		setTimeout(() => {
			routeImport().catch(() => {
				// Silently fail if preload fails
			})
		}, 100)
	}, [])

	useEffect(() => {
		const currentPath = location.pathname

		// Preload related routes based on current route
		switch (true) {
			case currentPath === AppRoutes.ANIMALS:
				// From Animals, users likely go to Animal details or AnimalForm
				preloadRoute(() => import('@/pages/Animal/Animal.page'))
				preloadRoute(() => import('@/pages/AnimalForm/AnimalForm.page'))
				break

			case currentPath.includes('/animal/'):
				// From Animal details, users likely go to related forms
				preloadRoute(() => import('@/pages/HealthRecordForm/HealthRecordForm.page'))
				preloadRoute(() => import('@/pages/ProductionRecordForm/ProductionRecordForm.page'))
				preloadRoute(() => import('@/pages/RelatedAnimalsForm/RelatedAnimalsForm.page'))
				break

			case currentPath === AppRoutes.EMPLOYEES:
				// From Employees, users likely go to EmployeeForm
				preloadRoute(() => import('@/pages/EmployeeForm/EmployeeForm.page'))
				break

			case currentPath === AppRoutes.TASKS:
				// From Tasks, users likely go to TaskForm
				preloadRoute(() => import('@/pages/TaskForm/TaskForm.page'))
				break

			case currentPath === AppRoutes.LOGIN:
				// After login, users go to Animals
				preloadRoute(() => import('@/pages/Animals/Animals.page'))
				break

			default:
				break
		}
	}, [location.pathname, preloadRoute])
}
