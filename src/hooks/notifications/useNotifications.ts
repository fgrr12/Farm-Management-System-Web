import { useCallback, useEffect, useMemo, useState } from 'react'

import { useFarmStore } from '@/store/useFarmStore'

export const useNotifications = () => {
	const { farm } = useFarmStore()
	const [notifications, setNotifications] = useState<NotificationData[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const mockNotifications: NotificationData[] = useMemo(
		() => [
			{
				uuid: '1',
				title: 'Medicación urgente - Vaca #123',
				message: 'Es hora de administrar antibióticos. Dosis: 10ml cada 12 horas por 5 días.',
				type: 'warning',
				category: 'medication',
				read: false,
				dismissed: false,
				createdAt: new Date().toISOString(),
				farmUuid: farm?.uuid || '',
				animalUuid: 'animal-123',
			},
			{
				uuid: '2',
				title: 'Chequeo veterinario completado',
				message: 'Revisión veterinaria completada para el toro #456. Todo en orden.',
				type: 'success',
				category: 'health',
				read: false,
				dismissed: false,
				createdAt: new Date(Date.now() - 1800000).toISOString(),
				farmUuid: farm?.uuid || '',
				animalUuid: 'animal-456',
			},
			{
				uuid: '3',
				title: 'Tarea vencida: Limpiar establos',
				message: 'La tarea "Limpiar establos del sector A" está vencida desde ayer.',
				type: 'error',
				category: 'task',
				read: false,
				dismissed: false,
				createdAt: new Date(Date.now() - 7200000).toISOString(),
				farmUuid: farm?.uuid || '',
			},
			{
				uuid: '4',
				title: 'Vacunación programada',
				message: 'Recordatorio: Vacunar terneros del lote B mañana a las 8:00 AM.',
				type: 'info',
				category: 'health',
				read: true,
				dismissed: false,
				createdAt: new Date(Date.now() - 10800000).toISOString(),
				farmUuid: farm?.uuid || '',
			},
			{
				uuid: '5',
				title: 'Medicación completada',
				message: 'Se completó el tratamiento de mastitis para la vaca #789.',
				type: 'success',
				category: 'medication',
				read: true,
				dismissed: false,
				createdAt: new Date(Date.now() - 14400000).toISOString(),
				farmUuid: farm?.uuid || '',
				animalUuid: 'animal-789',
			},
			{
				uuid: '6',
				title: 'Nueva tarea asignada',
				message: 'Se te ha asignado la tarea "Revisar cercas del pastizal norte".',
				type: 'info',
				category: 'task',
				read: false,
				dismissed: false,
				createdAt: new Date(Date.now() - 18000000).toISOString(),
				farmUuid: farm?.uuid || '',
			},
			{
				uuid: '7',
				title: 'Alerta de salud',
				message: 'La vaca #321 muestra signos de cojera. Requiere atención veterinaria.',
				type: 'warning',
				category: 'health',
				read: false,
				dismissed: false,
				createdAt: new Date(Date.now() - 21600000).toISOString(),
				farmUuid: farm?.uuid || '',
				animalUuid: 'animal-321',
			},
			{
				uuid: '8',
				title: 'Tarea completada',
				message: 'Has completado exitosamente la tarea "Alimentar ganado del sector C".',
				type: 'success',
				category: 'task',
				read: true,
				dismissed: false,
				createdAt: new Date(Date.now() - 25200000).toISOString(),
				farmUuid: farm?.uuid || '',
			},
		],
		[farm?.uuid]
	)

	const loadNotifications = useCallback(async () => {
		if (!farm) return

		setLoading(true)
		setError(null)

		try {
			await new Promise((resolve) => setTimeout(resolve, 500))
			setNotifications(mockNotifications)
		} catch (err) {
			setError('Error al cargar notificaciones')
			console.error('Error loading notifications:', err)
		} finally {
			setLoading(false)
		}
	}, [farm, mockNotifications])

	const markAsRead = useCallback(async (notificationId: string) => {
		setNotifications((prev) =>
			prev.map((notification) =>
				notification.uuid === notificationId ? { ...notification, read: true } : notification
			)
		)
	}, [])

	const markAllAsRead = useCallback(async () => {
		setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
	}, [])

	const dismissNotification = useCallback(async (notificationId: string) => {
		setNotifications((prev) =>
			prev.map((notification) =>
				notification.uuid === notificationId ? { ...notification, dismissed: true } : notification
			)
		)
	}, [])

	const getNotificationsByCategory = useCallback(
		(category?: string) => {
			if (!category || category === 'all') {
				return notifications.filter((n) => !n.dismissed)
			}
			return notifications.filter((n) => n.category === category && !n.dismissed)
		},
		[notifications]
	)

	useEffect(() => {
		loadNotifications()
	}, [loadNotifications])

	const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length
	const totalCount = notifications.filter((n) => !n.dismissed).length

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
		refresh: loadNotifications,

		permissionGranted: true,
	}
}
