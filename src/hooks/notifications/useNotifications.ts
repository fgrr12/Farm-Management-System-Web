import { useCallback, useEffect, useState } from 'react'

import { useFarmStore } from '@/store/useFarmStore'

import { NotificationsService } from '@/services/notifications'

import { useFCMToken } from './useFCMToken'

export const useNotifications = () => {
	const { farm } = useFarmStore()
	const { hasPermission } = useFCMToken()
	const [notifications, setNotifications] = useState<NotificationData[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const loadNotifications = useCallback(async () => {
		if (!farm?.uuid) {
			setNotifications([])
			return
		}

		setLoading(true)
		setError(null)

		try {
			const newNotifications = await NotificationsService.getNotifications({
				farmUuid: farm.uuid,
				limit: 50,
				unreadOnly: false,
			})
			setNotifications(newNotifications)
		} catch (err) {
			console.error('Error loading notifications:', err)
			setError('Error al cargar notificaciones')
			setNotifications([])
		} finally {
			setLoading(false)
		}
	}, [farm?.uuid])

	// Load notifications when farm changes
	useEffect(() => {
		loadNotifications()
	}, [loadNotifications])

	// Refresh notifications when FCM permissions change
	useEffect(() => {
		if (hasPermission && farm?.uuid) {
			loadNotifications()
		}
	}, [hasPermission, loadNotifications, farm?.uuid])

	const markAsRead = useCallback(async (notificationUuid: string) => {
		try {
			await NotificationsService.markNotificationAsRead(notificationUuid)
			// Update local state immediately for better UX
			setNotifications((prev) =>
				prev.map((notification) =>
					notification.uuid === notificationUuid ? { ...notification, read: true } : notification
				)
			)
		} catch (err) {
			console.error('Error marking notification as read:', err)
			setError('Error al marcar como leída')
		}
	}, [])

	const markAsDismissed = useCallback(async (notificationUuid: string) => {
		try {
			await NotificationsService.markNotificationAsDismissed(notificationUuid)
			// Remove from local state immediately
			setNotifications((prev) => prev.filter((n) => n.uuid !== notificationUuid))
		} catch (err) {
			console.error('Error dismissing notification:', err)
			setError('Error al descartar notificación')
		}
	}, [])

	const markAllAsRead = useCallback(async () => {
		try {
			const unreadNotifications = notifications.filter((n) => !n.read)

			// Update UI immediately
			setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))

			// Update backend
			await Promise.all(
				unreadNotifications.map((notification) =>
					NotificationsService.markNotificationAsRead(notification.uuid)
				)
			)
		} catch (err) {
			console.error('Error marking all as read:', err)
			setError('Error al marcar todas como leídas')
			// Revert UI changes on error
			loadNotifications()
		}
	}, [notifications, loadNotifications])

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
	const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length
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
		refresh: loadNotifications,
		permissionGranted: hasPermission,
	}
}
