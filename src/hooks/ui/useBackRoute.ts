import { matchPath, useLocation } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

export const useBackRoute = (): string | number => {
	const { pathname } = useLocation()

	const isMatch = (pattern: string) => !!matchPath(pattern, pathname)

	if (isMatch(AppRoutes.ANIMAL) || pathname === AppRoutes.ADD_ANIMAL) {
		return AppRoutes.ANIMALS
	}

	if (
		isMatch(AppRoutes.EDIT_ANIMAL) ||
		isMatch(AppRoutes.EDIT_HEALTH_RECORD) ||
		isMatch(AppRoutes.EDIT_PRODUCTION_RECORD) ||
		isMatch(AppRoutes.RELATED_ANIMALS)
	) {
		return AppRoutes.ANIMAL.replace(':animalUuid', pathname.split('/')[2])
	}

	if (pathname === AppRoutes.ADD_EMPLOYEE || isMatch(AppRoutes.EDIT_EMPLOYEE)) {
		return AppRoutes.EMPLOYEES
	}

	if (pathname === AppRoutes.ADD_TASK) {
		return AppRoutes.TASKS
	}

	return -1
}
