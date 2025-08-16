import { getMessaging, onMessage } from 'firebase/messaging'
import { useEffect, useRef } from 'react'

import { useFCMToken } from '@/hooks/notifications/useFCMToken'

export const NotificationToast = () => {
	const { hasPermission, isSupported } = useFCMToken()
	const unsubscribeRef = useRef<(() => void) | null>(null)

	useEffect(() => {
		if (!isSupported || !hasPermission) {
			return
		}

		// Cleanup previous listener if exists
		if (unsubscribeRef.current) {
			unsubscribeRef.current()
			unsubscribeRef.current = null
		}

		try {
			const messaging = getMessaging()

			const unsubscribe = onMessage(messaging, (payload) => {
				// Show browser notification if available
				if ('Notification' in window && Notification.permission === 'granted') {
					const notification = new Notification(
						payload.notification?.title || 'Nueva notificación',
						{
							body: payload.notification?.body,
							icon: payload.notification?.icon || '/pwa-192x192.png',
							tag: 'farm-notification-foreground',
							requireInteraction: false,
							data: payload.data || {},
						}
					)

					// Auto-close after 5 seconds
					setTimeout(() => {
						notification.close()
					}, 5000)

					// Handle click to focus app
					notification.onclick = () => {
						window.focus()
						notification.close()
					}
				}
			})

			unsubscribeRef.current = unsubscribe

			return () => {
				if (unsubscribeRef.current) {
					unsubscribeRef.current()
					unsubscribeRef.current = null
				}
			}
		} catch (error) {
			console.warn('[NotificationToast] Error setting up foreground listener:', error)
		}
	}, [isSupported, hasPermission])

	// This component doesn't render anything
	return null
}
