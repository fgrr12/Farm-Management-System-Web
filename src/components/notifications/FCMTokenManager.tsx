import { useEffect, useRef } from 'react'

import { useUserStore } from '@/store/useUserStore'

import { useFCMToken } from '@/hooks/notifications/useFCMToken'

export const FCMTokenManager = () => {
	const { user } = useUserStore()
	const { requestPermission, hasPermission, isSupported } = useFCMToken()
	const initializationStarted = useRef(false)
	const currentUserUuid = useRef<string | null>(null)

	useEffect(() => {
		// Only initialize once per user session
		if (
			user &&
			isSupported &&
			!hasPermission &&
			!initializationStarted.current &&
			currentUserUuid.current !== user.uuid
		) {
			initializationStarted.current = true
			currentUserUuid.current = user.uuid

			// Delay permission request to avoid immediate execution
			const timer = setTimeout(() => {
				requestPermission().catch((err) => {
					console.warn('Failed to request notification permission:', err)
					// Reset on error to allow retry
					initializationStarted.current = false
				})
			}, 2000) // Increased delay

			return () => clearTimeout(timer)
		}

		// Reset when user logs out
		if (!user) {
			initializationStarted.current = false
			currentUserUuid.current = null
		}
	}, [user, isSupported, hasPermission, requestPermission])

	// This component doesn't render anything
	return null
}
