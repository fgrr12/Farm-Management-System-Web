import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { NotificationsService } from '@/services/notifications'

export const NOTIFICATIONS_KEYS = {
	all: ['notifications'] as const,
	list: (farmUuid: string) => [...NOTIFICATIONS_KEYS.all, 'list', farmUuid] as const,
	unreadCount: (farmUuid: string) => [...NOTIFICATIONS_KEYS.all, 'unreadCount', farmUuid] as const,
}

// Real-time notifications hook using Firestore subscription
export const useNotifications = (farmUuid: string) => {
	const [notifications, setNotifications] = useState<NotificationData[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (!farmUuid) return

		let unsubscribe: (() => void) | undefined

		const setupSubscription = async () => {
			try {
				unsubscribe = await NotificationsService.subscribeToNotificationsRealTime(
					farmUuid,
					(data) => {
						setNotifications(data)
						setIsLoading(false)
					}
				)
			} catch (error) {
				console.error('Error setting up notifications subscription:', error)
				setIsLoading(false)
			}
		}

		setupSubscription()

		return () => {
			if (unsubscribe) {
				unsubscribe()
			}
		}
	}, [farmUuid])

	return { data: notifications, isLoading }
}

// Real-time unread count hook
export const useUnreadNotificationsCount = (farmUuid: string) => {
	const [count, setCount] = useState(0)

	useEffect(() => {
		if (!farmUuid) return

		let unsubscribe: (() => void) | undefined

		const setupSubscription = async () => {
			try {
				unsubscribe = await NotificationsService.subscribeToUnreadCount(farmUuid, setCount)
			} catch (error) {
				console.error('Error setting up unread count subscription:', error)
			}
		}

		setupSubscription()

		return () => {
			if (unsubscribe) {
				unsubscribe()
			}
		}
	}, [farmUuid])

	return count
}

export const useMarkNotificationAsRead = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (notificationUuid: string) =>
			NotificationsService.markNotificationAsRead(notificationUuid),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all })
		},
	})
}

export const useMarkNotificationAsDismissed = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (notificationUuid: string) =>
			NotificationsService.markNotificationAsDismissed(notificationUuid),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all })
		},
	})
}
