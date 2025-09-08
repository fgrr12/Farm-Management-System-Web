import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'

import { auth, firestore } from '@/config/firebaseConfig'

import { callableFireFunction } from '@/utils/callableFireFunction'

// Type mapping from backend notification types to frontend display types
const mapNotificationTypeToDisplayType = (
	backendType: string
): 'info' | 'success' | 'warning' | 'error' => {
	switch (backendType) {
		case 'health_alert':
		case 'system_alert':
			return 'error'
		case 'medication_reminder':
		case 'calendar_reminder':
			return 'warning'
		case 'task_update':
			return 'info'
		case 'production_summary':
			return 'success'
		default:
			return 'info'
	}
}

// Type mapping from backend notification types to frontend categories
const mapNotificationTypeToCategory = (
	backendType: string
): 'general' | 'medication' | 'health' | 'task' | 'production' => {
	switch (backendType) {
		case 'health_alert':
			return 'health'
		case 'medication_reminder':
			return 'medication'
		case 'task_update':
			return 'task'
		case 'production_summary':
			return 'production'
		default:
			return 'general'
	}
}

// Transform backend notification to frontend format
const transformNotification = (backendNotification: any): NotificationData => {
	const userUuid = auth.currentUser?.uid || ''

	return {
		uuid: backendNotification.uuid,
		title: backendNotification.title,
		message: backendNotification.message,
		type: mapNotificationTypeToDisplayType(backendNotification.type),
		category: mapNotificationTypeToCategory(backendNotification.type),
		read: backendNotification.readBy?.includes(userUuid) || false,
		dismissed: backendNotification.dismissedBy?.includes(userUuid) || false,
		createdAt: backendNotification.createdAt,
		farmUuid: backendNotification.farmUuid,
		animalUuid: backendNotification.relatedId, // Assuming relatedId is animalUuid when relatedType is 'animal'
		priority: backendNotification.priority || 'medium',
	}
}

export type NotificationSubscriptionCallback = (notifications: NotificationData[]) => void

const markNotificationAsRead = async (notificationUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('notifications', {
		operation: 'markNotificationAsRead',
		notificationUuid,
	})
	return response
}

const markNotificationAsDismissed = async (notificationUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('notifications', {
		operation: 'markNotificationAsDismissed',
		notificationUuid,
	})
	return response
}

const registerDeviceToken = async (tokenData: {
	token: string
	deviceType: string
	userAgent?: string
}): Promise<void> => {
	try {
		// Map deviceType to platform expected by backend
		let platform: 'ios' | 'android' | 'web' = 'web'

		if (tokenData.deviceType === 'mobile') {
			// Detect mobile platform from userAgent
			if (tokenData.userAgent?.includes('iPhone') || tokenData.userAgent?.includes('iPad')) {
				platform = 'ios'
			} else if (tokenData.userAgent?.includes('Android')) {
				platform = 'android'
			}
		}

		await callableFireFunction('notifications', {
			operation: 'registerDeviceToken',
			token: tokenData.token,
			platform,
		})
	} catch (error) {
		console.error('Error registering device token:', error)
		throw error
	}
}

const removeDeviceToken = async (token: string): Promise<void> => {
	try {
		await callableFireFunction('notifications', {
			operation: 'removeDeviceToken',
			token,
		})
	} catch (error) {
		console.error('Error removing device token:', error)
		throw error
	}
}

// Real-time subscription using Firestore onSnapshot
const subscribeToNotificationsRealTime = async (
	farmUuid: string,
	callback: NotificationSubscriptionCallback
): Promise<() => void> => {
	if (!auth.currentUser) {
		console.warn('User not authenticated for real-time notifications')
		return () => {}
	}

	const userUuid = auth.currentUser.uid

	const notificationsQuery = query(
		collection(firestore, 'notifications'),
		where('farmUuid', '==', farmUuid),
		orderBy('createdAt', 'desc')
	)

	const unsubscribe = onSnapshot(
		notificationsQuery,
		(snapshot) => {
			const notifications: NotificationData[] = []

			snapshot.forEach((doc) => {
				const data = doc.data()

				if (!data.dismissedBy?.includes(userUuid)) {
					const notification = transformNotification({
						uuid: doc.id,
						...data,
					})
					notifications.push(notification)
				}
			})

			callback(notifications)
		},
		(error) => {
			console.error('Error in real-time notifications subscription:', error)
		}
	)

	return unsubscribe
}

// Real-time subscription for unread count
const subscribeToUnreadCount = async (
	farmUuid: string,
	callback: (count: number) => void
): Promise<() => void> => {
	if (!auth.currentUser) {
		console.warn('User not authenticated for unread count subscription')
		return () => {}
	}

	const userUuid = auth.currentUser.uid

	const notificationsQuery = query(
		collection(firestore, 'notifications'),
		where('farmUuid', '==', farmUuid)
	)

	const unsubscribe = onSnapshot(
		notificationsQuery,
		(snapshot) => {
			let unreadCount = 0

			snapshot.forEach((doc) => {
				const data = doc.data()

				// Contar solo las que no están leídas ni dismissed por este usuario
				const isRead = data.readBy?.includes(userUuid) || false
				const isDismissed = data.dismissedBy?.includes(userUuid) || false

				if (!isRead && !isDismissed) {
					unreadCount++
				}
			})

			callback(unreadCount)
		},
		(error) => {
			console.error('Error in unread count subscription:', error)
		}
	)

	return unsubscribe
}

export const NotificationsService = {
	markNotificationAsRead,
	markNotificationAsDismissed,
	registerDeviceToken,
	removeDeviceToken,
	subscribeToNotificationsRealTime,
	subscribeToUnreadCount,
}
