import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useUserStore } from '@/store/useUserStore'

export const PrivateRoute = ({
	children,
	requiredRoles,
}: {
	children: ReactNode
	requiredRoles?: string[]
}) => {
	const location = useLocation()
	const { user } = useUserStore()

	if (!user || (requiredRoles && !requiredRoles.includes(user.role))) {
		return <Navigate to={AppRoutes.LOGIN} state={{ from: location }} replace />
	}

	return <>{children}</>
}
