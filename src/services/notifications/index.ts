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
): 'general' | 'medication' | 'health' | 'task' => {
	switch (backendType) {
		case 'health_alert':
			return 'health'
		case 'medication_reminder':
			return 'medication'
		case 'task_update':
			return 'task'
		case 'calendar_reminder':
		case 'production_summary':
		case 'system_alert':
		default:
			return 'general'
	}
}

// Transform backend notification to frontend format
const transformNotification = (backendNotification: any): NotificationData => {
	return {
		uuid: backendNotification.uuid,
		title: backendNotification.title,
		message: backendNotification.message,
		type: mapNotificationTypeToDisplayType(backendNotification.type),
		category: mapNotificationTypeToCategory(backendNotification.type),
		read: backendNotification.status?.read || false,
		dismissed: backendNotification.status?.dismissed || false,
		createdAt: backendNotification.createdAt,
		farmUuid: backendNotification.farmUuid,
		animalUuid: backendNotification.relatedId, // Assuming relatedId is animalUuid when relatedType is 'animal'
		priority: backendNotification.priority || 'medium',
	}
}

export interface GetNotificationsParams {
	farmUuid?: string
	limit?: number
	offset?: number
	unreadOnly?: boolean
	type?:
		| 'health_alert'
		| 'medication_reminder'
		| 'calendar_reminder'
		| 'task_update'
		| 'production_summary'
		| 'system_alert'
		| undefined
	priority?: 'low' | 'medium' | 'high' | undefined
}

export type NotificationSubscriptionCallback = (notifications: NotificationData[]) => void

// Subscription management
let subscriptionInterval: NodeJS.Timeout | null = null
let subscriptionCallback: NotificationSubscriptionCallback | null = null
let lastFarmUuid: string | null = null

const getNotifications = async (
	params: GetNotificationsParams = {}
): Promise<NotificationData[]> => {
	try {
		const response = await callableFireFunction<{
			success: boolean
			data: any[]
			count: number
		}>('notifications', {
			operation: 'getUserNotifications',
			...params,
			offset: params.offset || 0,
			type: params.type || undefined,
			priority: params.priority || undefined,
		})

		if (response.success && response.data) {
			// Transform backend notifications to frontend format
			return response.data.map(transformNotification)
		}

		return []
	} catch (error) {
		console.error('Error getting notifications:', error)
		throw error
	}
}

const getNotificationByUuid = async (notificationUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('notifications', {
		operation: 'getNotificationByUuid',
		notificationUuid,
	})
	return response.data
}

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

const markAllNotificationsAsRead = async (userUuid: string, farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('notifications', {
		operation: 'markAllNotificationsAsRead',
		userUuid,
		farmUuid,
	})
	return response
}

const deleteNotification = async (notificationUuid: string, userUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('notifications', {
		operation: 'deleteNotification',
		notificationUuid,
		userUuid,
	})
	return response
}

const getUnreadNotificationsCount = async (farmUuid: string): Promise<number> => {
	try {
		const response = await callableFireFunction<{ success: boolean; data: number }>(
			'notifications',
			{
				operation: 'getUnreadNotificationCount',
				farmUuid,
			}
		)

		if (response.success && typeof response.data === 'number') {
			return response.data
		}

		return 0
	} catch (error) {
		console.error('Error getting unread count:', error)
		throw error
	}
}

const createNotification = async (notificationData: {
	farmUuid: string
	title: string
	message: string
	type:
		| 'health_alert'
		| 'medication_reminder'
		| 'calendar_reminder'
		| 'task_update'
		| 'production_summary'
		| 'system_alert'
	priority?: 'low' | 'medium' | 'high' | 'critical'
	relatedType?: 'animal' | 'task' | 'calendar_event' | 'production'
	relatedId?: string
	scheduledFor?: string
	data?: Record<string, any>
}): Promise<string> => {
	try {
		const response = await callableFireFunction<{ success: boolean; data: string }>(
			'notifications',
			{
				operation: 'createNotification',
				...notificationData,
			}
		)

		if (response.success && response.data) {
			return response.data
		}

		throw new Error('Failed to create notification')
	} catch (error) {
		console.error('Error creating notification:', error)
		throw error
	}
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

const sendHealthAlert = async (animalUuid: string, healthStatus: string, farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('notifications', {
		operation: 'sendHealthAlert',
		animalUuid,
		healthStatus,
		farmUuid,
	})
	return response
}

const sendRecoveryNotification = async (animalUuid: string, farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('notifications', {
		operation: 'sendRecoveryNotification',
		animalUuid,
		farmUuid,
	})
	return response
}

const sendTaskReminder = async (taskUuid: string, farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('notifications', {
		operation: 'sendTaskReminder',
		taskUuid,
		farmUuid,
	})
	return response
}

const sendVaccineReminder = async (animalUuid: string, vaccineType: string, farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('notifications', {
		operation: 'sendVaccineReminder',
		animalUuid,
		vaccineType,
		farmUuid,
	})
	return response
}

// Subscription functionality for real-time notifications
const subscribeToNotifications = (
	farmUuid: string,
	callback: NotificationSubscriptionCallback,
	intervalMs = 30000 // 30 seconds by default
): (() => void) => {
	// Clear any existing subscription
	unsubscribeFromNotifications()

	lastFarmUuid = farmUuid
	subscriptionCallback = callback

	const fetchNotifications = async () => {
		try {
			if (lastFarmUuid && subscriptionCallback) {
				const notifications = await getNotifications({
					farmUuid: lastFarmUuid,
					limit: 50,
					unreadOnly: false,
				})
				subscriptionCallback(notifications)
			}
		} catch (error) {
			console.error('Error fetching notifications in subscription:', error)
		}
	}

	// Initial fetch
	fetchNotifications()

	// Set up interval for polling
	subscriptionInterval = setInterval(fetchNotifications, intervalMs)

	// Return unsubscribe function
	return unsubscribeFromNotifications
}

const unsubscribeFromNotifications = (): void => {
	if (subscriptionInterval) {
		clearInterval(subscriptionInterval)
		subscriptionInterval = null
	}
	subscriptionCallback = null
	lastFarmUuid = null
}

// Enhanced polling with exponential backoff for errors
const subscribeToNotificationsWithBackoff = (
	farmUuid: string,
	callback: NotificationSubscriptionCallback,
	options: {
		intervalMs?: number
		maxRetries?: number
		backoffMultiplier?: number
	} = {}
): (() => void) => {
	const { intervalMs = 30000, maxRetries = 3, backoffMultiplier = 2 } = options

	// Clear any existing subscription
	unsubscribeFromNotifications()

	lastFarmUuid = farmUuid
	subscriptionCallback = callback

	let retryCount = 0
	let currentInterval = intervalMs

	const fetchNotifications = async () => {
		try {
			if (lastFarmUuid && subscriptionCallback) {
				const notifications = await getNotifications({
					farmUuid: lastFarmUuid,
					limit: 50,
					unreadOnly: false,
				})
				subscriptionCallback(notifications)

				// Reset retry count on success
				retryCount = 0
				currentInterval = intervalMs
			}
		} catch (error) {
			console.error('Error fetching notifications in subscription:', error)

			retryCount++
			if (retryCount <= maxRetries) {
				// Exponential backoff
				currentInterval = intervalMs * backoffMultiplier ** retryCount
				console.warn(`Retrying in ${currentInterval}ms (attempt ${retryCount}/${maxRetries})`)
			} else {
				console.error('Max retries reached, stopping subscription')
				unsubscribeFromNotifications()
				return
			}
		}

		// Schedule next fetch only if subscription is still active
		if (subscriptionInterval) {
			subscriptionInterval = setTimeout(fetchNotifications, currentInterval)
		}
	}

	// Initial fetch
	fetchNotifications()

	// Return unsubscribe function
	return unsubscribeFromNotifications
}

export const NotificationsService = {
	getNotifications,
	getNotificationByUuid,
	markNotificationAsRead,
	markNotificationAsDismissed,
	markAllNotificationsAsRead,
	deleteNotification,
	getUnreadNotificationsCount,
	createNotification,
	registerDeviceToken,
	removeDeviceToken,
	sendHealthAlert,
	sendRecoveryNotification,
	sendTaskReminder,
	sendVaccineReminder,
	subscribeToNotifications,
	unsubscribeFromNotifications,
	subscribeToNotificationsWithBackoff,
}
