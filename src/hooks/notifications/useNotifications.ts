import { useCallback, useEffect, useState } from 'react'

import { useFarmStore } from '@/store/useFarmStore'

import { NotificationService } from '@/services/notifications/notificationService'

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

		const unsubscribe = NotificationService.subscribeToNotifications(
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

	const markAsRead = useCallback(async (notificationId: string) => {
		try {
			await NotificationService.markAsRead(notificationId)
		} catch (err) {
			console.error('Error marking notification as read:', err)
			setError('Error al marcar como leída')
		}
	}, [])

	const markAllAsRead = useCallback(async () => {
		if (!farm?.uuid) return

		try {
			await NotificationService.markAllAsRead(farm.uuid)
		} catch (err) {
			console.error('Error marking all notifications as read:', err)
			setError('Error al marcar todas como leídas')
		}
	}, [farm?.uuid])

	const dismissNotification = useCallback(async (notificationId: string) => {
		try {
			await NotificationService.dismissNotification(notificationId)
		} catch (err) {
			console.error('Error dismissing notification:', err)
			setError('Error al descartar notificación')
		}
	}, [])

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
		// No necesario con Firebase real-time, pero mantenemos la interfaz
		console.log('Notifications refresh requested - using real-time updates')
	}, [])

	const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length
	const totalCount = notifications.filter((n) => !n.dismissed).length

	const createMedicationNotification = useCallback(
		async (animalUuid: string, medication: string, dosage: string, dueTime: Date) => {
			if (!farm?.uuid) return

			try {
				return await NotificationService.createMedicationNotification(
					farm.uuid,
					animalUuid,
					medication,
					dosage,
					dueTime
				)
			} catch (err) {
				console.error('Error creating medication notification:', err)
				setError('Error al crear notificación de medicación')
			}
		},
		[farm?.uuid]
	)

	const createHealthNotification = useCallback(
		async (
			animalUuid: string,
			title: string,
			message: string,
			type: NotificationData['type'] = 'info'
		) => {
			if (!farm?.uuid) return

			try {
				return await NotificationService.createHealthNotification(
					farm.uuid,
					animalUuid,
					title,
					message,
					type
				)
			} catch (err) {
				console.error('Error creating health notification:', err)
				setError('Error al crear notificación de salud')
			}
		},
		[farm?.uuid]
	)

	const createTaskNotification = useCallback(
		async (
			title: string,
			message: string,
			type: NotificationData['type'] = 'info',
			actionUrl?: string
		) => {
			if (!farm?.uuid) return

			try {
				return await NotificationService.createTaskNotification(
					farm.uuid,
					title,
					message,
					type,
					actionUrl
				)
			} catch (err) {
				console.error('Error creating task notification:', err)
				setError('Error al crear notificación de tarea')
			}
		},
		[farm?.uuid]
	)

	const createGeneralNotification = useCallback(
		async (title: string, message: string, type: NotificationData['type'] = 'info') => {
			if (!farm?.uuid) return

			try {
				return await NotificationService.createGeneralNotification(farm.uuid, title, message, type)
			} catch (err) {
				console.error('Error creating general notification:', err)
				setError('Error al crear notificación general')
			}
		},
		[farm?.uuid]
	)

	return {
		notifications: notifications.filter((n) => !n.dismissed),
		loading,
		error,

		unreadCount,
		totalCount,

		markAsRead,
		markAllAsRead,
		dismissNotification,
		getNotificationsByCategory,
		getNotificationsByPriority,
		refresh,

		createMedicationNotification,
		createHealthNotification,
		createTaskNotification,
		createGeneralNotification,

		permissionGranted: true,
	}
}
