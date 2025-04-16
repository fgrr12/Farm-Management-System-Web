import { AppRoutes } from '@/config/constants/routes'
import { useUserStore } from '@/store/useUserStore'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export const PrivateRoute = ({
	children,
}: {
	children: ReactNode
}) => {
	const location = useLocation()
	const { user } = useUserStore()

	if (!user) {
		return <Navigate to={AppRoutes.LOGIN} state={{ from: location }} replace />
	}

	return <>{children}</>
}
