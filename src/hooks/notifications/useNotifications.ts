import { useCallback } from 'react'

import { useNotificationStore } from '@/store/useNotificationStore'

import { NotificationsService } from '@/services/notifications'

import { useFCMToken } from './useFCMToken'

export const useNotifications = () => {
	const { hasPermission } = useFCMToken()
	const { notifications, unreadCount, loading, error, setNotifications } = useNotificationStore()

	const markAsRead = useCallback(
		async (notificationUuid: string) => {
			try {
				await NotificationsService.markNotificationAsRead(notificationUuid)
				// Update local state immediately for better UX
				setNotifications(
					notifications.map((notification) =>
						notification.uuid === notificationUuid ? { ...notification, read: true } : notification
					)
				)
			} catch (err) {
				console.error('Error marking notification as read:', err)
			}
		},
		[notifications, setNotifications]
	)

	const markAsDismissed = useCallback(
		async (notificationUuid: string) => {
			try {
				await NotificationsService.markNotificationAsDismissed(notificationUuid)
				// Remove from local state immediately
				setNotifications(notifications.filter((n) => n.uuid !== notificationUuid))
			} catch (err) {
				console.error('Error dismissing notification:', err)
			}
		},
		[notifications, setNotifications]
	)

	const markAllAsRead = useCallback(async () => {
		try {
			const unreadNotifications = notifications.filter((n) => !n.read)

			// Update UI immediately
			setNotifications(notifications.map((notification) => ({ ...notification, read: true })))

			// Update backend
			await Promise.all(
				unreadNotifications.map((notification) =>
					NotificationsService.markNotificationAsRead(notification.uuid)
				)
			)
		} catch (err) {
			console.error('Error marking all as read:', err)
			// Note: Real-time subscription will revert changes automatically
		}
	}, [notifications, setNotifications])

	const getNotificationsByCategory = useCallback(
		(category: string) => {
			if (category === 'all') {
				return notifications.filter((n) => !n.dismissed)
			}
			return notifications.filter((n) => !n.dismissed && n.category === category)
		},
		[notifications]
	)

	// Computed values
	const totalCount = notifications.filter((n) => !n.dismissed).length

	return {
		notifications: notifications.filter((n) => !n.dismissed),
		loading,
		error,
		unreadCount,
		totalCount,
		markAsRead,
		markAsDismissed,
		markAllAsRead,
		getNotificationsByCategory,
		permissionGranted: hasPermission,
	}
}
