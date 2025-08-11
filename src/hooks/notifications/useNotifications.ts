import { useCallback, useEffect, useState } from 'react'

import { useFarmStore } from '@/store/useFarmStore'

import { NotificationsService } from '@/services/notifications'

export const useNotifications = () => {
	const { farm } = useFarmStore()
	const [notifications, setNotifications] = useState<NotificationData[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!farm?.uuid) {
			setNotifications([])
			return
		}

		setLoading(true)
		setError(null)

		const unsubscribe = NotificationsService.subscribeToNotifications(
			farm.uuid,
			(newNotifications) => {
				setNotifications(newNotifications)
				setLoading(false)
				setError(null)
			}
		)

		return () => {
			unsubscribe()
		}
	}, [farm?.uuid])

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
			// Update local state immediately for better UX
			setNotifications((prev) =>
				prev.map((notification) =>
					notification.uuid === notificationUuid
						? { ...notification, dismissed: true }
						: notification
				)
			)
		} catch (err) {
			console.error('Error dismissing notification:', err)
			setError('Error al descartar notificación')
		}
	}, [])

	const markAllAsRead = useCallback(async () => {
		if (!farm?.uuid) return

		try {
			// Get the user UUID from auth context if available, or handle differently
			// For now, we'll mark each notification individually
			const unreadNotifications = notifications.filter((n) => !n.read)
			await Promise.all(
				unreadNotifications.map((notification) =>
					NotificationsService.markNotificationAsRead(notification.uuid)
				)
			)

			// Update local state
			setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
		} catch (err) {
			console.error('Error marking all notifications as read:', err)
			setError('Error al marcar todas como leídas')
		}
	}, [farm?.uuid, notifications])

	const getNotificationsByCategory = useCallback(
		(category?: string) => {
			let filtered: NotificationData[]

			if (!category || category === 'all') {
				filtered = notifications.filter((n) => !n.dismissed)
			} else {
				filtered = notifications.filter((n) => n.category === category && !n.dismissed)
			}

			return filtered.sort((a, b) => {
				const dateA = new Date(a.createdAt).getTime()
				const dateB = new Date(b.createdAt).getTime()
				return dateB - dateA
			})
		},
		[notifications]
	)

	const getNotificationsByPriority = useCallback(() => {
		const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }

		return notifications
			.filter((n) => !n.dismissed)
			.sort((a, b) => {
				const priorityA = priorityOrder[a.priority || 'medium']
				const priorityB = priorityOrder[b.priority || 'medium']

				if (priorityA !== priorityB) {
					return priorityB - priorityA
				}

				const dateA = new Date(a.createdAt).getTime()
				const dateB = new Date(b.createdAt).getTime()
				return dateB - dateA
			})
	}, [notifications])

	// Refrescar notificaciones manualmente
	const refresh = useCallback(async () => {
		if (!farm?.uuid) return

		try {
			setLoading(true)
			const freshNotifications = await NotificationsService.getNotifications({
				farmUuid: farm.uuid,
				limit: 50,
			})
			setNotifications(freshNotifications)
			setError(null)
		} catch (err) {
			console.error('Error refreshing notifications:', err)
			setError('Error al actualizar notificaciones')
		} finally {
			setLoading(false)
		}
	}, [farm?.uuid])

	const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length
	const totalCount = notifications.filter((n) => !n.dismissed).length

	const createNotification = useCallback(
		async (notificationData: {
			title: string
			message: string
			category: string
			priority?: string
			targetUserUuids?: string[]
			metadata?: Record<string, any>
		}) => {
			if (!farm?.uuid) return

			try {
				return await NotificationsService.createNotification({
					...notificationData,
					farmUuid: farm.uuid,
				})
			} catch (err) {
				console.error('Error creating notification:', err)
				setError('Error al crear notificación')
			}
		},
		[farm?.uuid]
	)

	const createMedicationNotification = useCallback(
		async (animalUuid: string, medication: string, dosage: string, dueTime: Date) => {
			if (!farm?.uuid) return

			try {
				return await createNotification({
					title: 'Medicación pendiente',
					message: `${medication} - ${dosage} para animal ${animalUuid}`,
					category: 'medication',
					priority: 'high',
					metadata: {
						animalUuid,
						medication,
						dosage,
						dueTime: dueTime.toISOString(),
					},
				})
			} catch (err) {
				console.error('Error creating medication notification:', err)
				setError('Error al crear notificación de medicación')
			}
		},
		[farm?.uuid, createNotification]
	)

	const createHealthNotification = useCallback(
		async (animalUuid: string, title: string, message: string, priority = 'medium') => {
			if (!farm?.uuid) return

			try {
				return await createNotification({
					title,
					message,
					category: 'health',
					priority,
					metadata: {
						animalUuid,
					},
				})
			} catch (err) {
				console.error('Error creating health notification:', err)
				setError('Error al crear notificación de salud')
			}
		},
		[farm?.uuid, createNotification]
	)

	const createTaskNotification = useCallback(
		async (title: string, message: string, priority = 'medium', actionUrl?: string) => {
			if (!farm?.uuid) return

			try {
				return await createNotification({
					title,
					message,
					category: 'task',
					priority,
					metadata: {
						actionUrl,
					},
				})
			} catch (err) {
				console.error('Error creating task notification:', err)
				setError('Error al crear notificación de tarea')
			}
		},
		[farm?.uuid, createNotification]
	)

	const createGeneralNotification = useCallback(
		async (title: string, message: string, priority = 'medium') => {
			if (!farm?.uuid) return

			try {
				return await createNotification({
					title,
					message,
					category: 'general',
					priority,
				})
			} catch (err) {
				console.error('Error creating general notification:', err)
				setError('Error al crear notificación general')
			}
		},
		[farm?.uuid, createNotification]
	)

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
		getNotificationsByPriority,
		refresh,

		createNotification,
		createMedicationNotification,
		createHealthNotification,
		createTaskNotification,
		createGeneralNotification,

		permissionGranted: true,
	}
}
