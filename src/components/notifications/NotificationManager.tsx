import { useEffect, useRef } from 'react'

import { useFarmStore } from '@/store/useFarmStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useUserStore } from '@/store/useUserStore'

import { NotificationsService } from '@/services/notifications'

/**
 * NotificationManager component that initializes real-time notification subscriptions
 * when user is authenticated and farm data is loaded.
 * This should be rendered once in the App component.
 */
export const NotificationManager = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const { setNotifications, setUnreadCount, setLoading, setError, reset } = useNotificationStore()
	const subscriptionsRef = useRef<{
		notifications?: () => void
		unreadCount?: () => void
	}>({})

	useEffect(() => {
		// Clean up existing subscriptions
		const cleanup = () => {
			if (subscriptionsRef.current.notifications) {
				subscriptionsRef.current.notifications()
				subscriptionsRef.current.notifications = undefined
			}
			if (subscriptionsRef.current.unreadCount) {
				subscriptionsRef.current.unreadCount()
				subscriptionsRef.current.unreadCount = undefined
			}
		}

		// Only initialize if user is authenticated and farm is loaded
		if (!user || !farm?.uuid) {
			cleanup()
			reset()
			return
		}
		setLoading(true)

		const initializeSubscriptions = async () => {
			try {
				// Set up notifications subscription
				const notificationsUnsubscribe =
					await NotificationsService.subscribeToNotificationsRealTime(
						farm.uuid,
						(notifications) => {
							setNotifications(notifications)
							setError(null)
						}
					)

				// Set up unread count subscription
				const unreadCountUnsubscribe = await NotificationsService.subscribeToUnreadCount(
					farm.uuid,
					(count) => {
						setUnreadCount(count)
					}
				)

				subscriptionsRef.current = {
					notifications: notificationsUnsubscribe,
					unreadCount: unreadCountUnsubscribe,
				}
			} catch (error) {
				console.error('[NotificationManager] Failed to initialize subscriptions:', error)
				setError('Error al configurar notificaciones en tiempo real')
			}
		}

		// Small delay to ensure auth state is fully established
		const timer = setTimeout(initializeSubscriptions, 500)

		return () => {
			clearTimeout(timer)
			cleanup()
		}
	}, [user, farm?.uuid, setNotifications, setUnreadCount, setLoading, setError, reset])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (subscriptionsRef.current.notifications) {
				subscriptionsRef.current.notifications()
			}
			if (subscriptionsRef.current.unreadCount) {
				subscriptionsRef.current.unreadCount()
			}
		}
	}, [])

	// This component doesn't render anything
	return null
}
