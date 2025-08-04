import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	limit,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	Timestamp,
	updateDoc,
	where,
	writeBatch,
} from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'

const COLLECTION = 'notifications'

export async function createNotification(
	notification: Omit<NotificationData, 'uuid' | 'createdAt'>
): Promise<string> {
	try {
		const docRef = await addDoc(collection(firestore, COLLECTION), {
			...notification,
			priority: notification.priority || 'medium',
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		})

		return docRef.id
	} catch (error) {
		console.error('Error creating notification:', error)
		throw new Error('Failed to create notification')
	}
}

export function subscribeToNotifications(
	farmUuid: string,
	callback: (notifications: NotificationData[]) => void
): () => void {
	const q = query(
		collection(firestore, COLLECTION),
		where('farmUuid', '==', farmUuid),
		where('read', '==', false),
		orderBy('createdAt', 'desc'),
		limit(50)
	)

	return onSnapshot(
		q,
		(snapshot) => {
			const notifications: NotificationData[] = []

			snapshot.forEach((doc) => {
				const data = doc.data()
				notifications.push({
					uuid: doc.id,
					title: data.title,
					message: data.message,
					type: data.type,
					category: data.category,
					read: data.read || false,
					dismissed: data.dismissed || false,
					createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
					farmUuid: data.farmUuid,
					animalUuid: data.animalUuid,
					eventUuid: data.eventUuid,
					actionUrl: data.actionUrl,
					priority: data.priority || 'medium',
				})
			})

			callback(notifications)
		},
		(error) => {
			console.error('Error listening to notifications:', error)
			callback([])
		}
	)
}

export async function markAsRead(notificationId: string): Promise<void> {
	try {
		const docRef = doc(firestore, COLLECTION, notificationId)
		await updateDoc(docRef, {
			read: true,
			updatedAt: serverTimestamp(),
		})
	} catch (error) {
		console.error('Error marking notification as read:', error)
		throw new Error('Failed to mark notification as read')
	}
}

export async function markAllAsRead(farmUuid: string): Promise<void> {
	try {
		const q = query(
			collection(firestore, COLLECTION),
			where('farmUuid', '==', farmUuid),
			where('read', '==', false),
			where('dismissed', '==', false)
		)

		const snapshot = await getDocs(q)
		const batch = writeBatch(firestore)

		snapshot.forEach((doc) => {
			batch.update(doc.ref, {
				read: true,
				updatedAt: serverTimestamp(),
			})
		})

		await batch.commit()
	} catch (error) {
		console.error('Error marking all notifications as read:', error)
		throw new Error('Failed to mark all notifications as read')
	}
}

export async function dismissNotification(notificationId: string): Promise<void> {
	try {
		const docRef = doc(firestore, COLLECTION, notificationId)
		await updateDoc(docRef, {
			dismissed: true,
			updatedAt: serverTimestamp(),
		})
	} catch (error) {
		console.error('Error dismissing notification:', error)
		throw new Error('Failed to dismiss notification')
	}
}

export async function deleteNotification(notificationId: string): Promise<void> {
	try {
		const docRef = doc(firestore, COLLECTION, notificationId)
		await deleteDoc(docRef)
	} catch (error) {
		console.error('Error deleting notification:', error)
		throw new Error('Failed to delete notification')
	}
}

export async function createMedicationNotification(
	farmUuid: string,
	animalUuid: string,
	medication: string,
	dosage: string,
	dueTime: Date
): Promise<string> {
	const now = new Date()
	const isOverdue = dueTime < now

	return createNotification({
		title: isOverdue ? 'Medicación vencida' : 'Medicación pendiente',
		message: `${medication} - ${dosage}. ${isOverdue ? 'Vencida desde' : 'Programada para'} ${dueTime.toLocaleString()}`,
		type: isOverdue ? 'error' : 'warning',
		category: 'medication',
		read: false,
		dismissed: false,
		farmUuid,
		animalUuid,
		priority: isOverdue ? 'high' : 'medium',
	})
}

export async function createHealthNotification(
	farmUuid: string,
	animalUuid: string,
	title: string,
	message: string,
	type: NotificationData['type'] = 'info'
): Promise<string> {
	return createNotification({
		title,
		message,
		type,
		category: 'health',
		read: false,
		dismissed: false,
		farmUuid,
		animalUuid,
		priority: type === 'error' ? 'high' : 'medium',
	})
}

export async function createTaskNotification(
	farmUuid: string,
	title: string,
	message: string,
	type: NotificationData['type'] = 'info',
	actionUrl?: string
): Promise<string> {
	return createNotification({
		title,
		message,
		type,
		category: 'task',
		read: false,
		dismissed: false,
		farmUuid,
		actionUrl,
		priority: type === 'error' ? 'high' : 'medium',
	})
}

export async function createGeneralNotification(
	farmUuid: string,
	title: string,
	message: string,
	type: NotificationData['type'] = 'info'
): Promise<string> {
	return createNotification({
		title,
		message,
		type,
		category: 'general',
		read: false,
		dismissed: false,
		farmUuid,
		priority: 'low',
	})
}

export async function getNotificationStats(farmUuid: string): Promise<{
	total: number
	unread: number
	byCategory: Record<string, number>
	byType: Record<string, number>
}> {
	try {
		const q = query(
			collection(firestore, COLLECTION),
			where('farmUuid', '==', farmUuid),
			where('read', '==', false)
		)

		const snapshot = await getDocs(q)
		const stats = {
			total: 0,
			unread: 0,
			byCategory: {} as Record<string, number>,
			byType: {} as Record<string, number>,
		}

		snapshot.forEach((doc) => {
			const data = doc.data()
			stats.total++

			if (!data.read) {
				stats.unread++
			}

			const category = data.category || 'general'
			stats.byCategory[category] = (stats.byCategory[category] || 0) + 1

			const type = data.type || 'info'
			stats.byType[type] = (stats.byType[type] || 0) + 1
		})

		return stats
	} catch (error) {
		console.error('Error getting notification stats:', error)
		return {
			total: 0,
			unread: 0,
			byCategory: {},
			byType: {},
		}
	}
}

export async function cleanupOldNotifications(farmUuid: string): Promise<number> {
	try {
		const thirtyDaysAgo = new Date()
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

		const q = query(
			collection(firestore, COLLECTION),
			where('farmUuid', '==', farmUuid),
			where('createdAt', '<', Timestamp.fromDate(thirtyDaysAgo))
		)

		const snapshot = await getDocs(q)
		const batch = writeBatch(firestore)

		snapshot.forEach((doc) => {
			batch.delete(doc.ref)
		})

		await batch.commit()
		return snapshot.size
	} catch (error) {
		console.error('Error cleaning up old notifications:', error)
		return 0
	}
}

export const NotificationService = {
	createNotification,
	subscribeToNotifications,
	markAsRead,
	markAllAsRead,
	dismissNotification,
	deleteNotification,
	createMedicationNotification,
	createHealthNotification,
	createTaskNotification,
	createGeneralNotification,
	getNotificationStats,
	cleanupOldNotifications,
}
