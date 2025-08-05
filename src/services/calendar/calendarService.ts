import dayjs from 'dayjs'
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	onSnapshot,
	query,
	serverTimestamp,
	updateDoc,
	where,
	writeBatch,
} from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'

const COLLECTION = 'calendarEvents'

/**
 * Crear un nuevo evento de calendario
 */
export async function createCalendarEvent(
	event: Omit<CalendarEvent, 'uuid' | 'createdAt' | 'updatedAt'>
): Promise<string> {
	try {
		const docRef = await addDoc(collection(firestore, COLLECTION), {
			...event,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		})

		return docRef.id
	} catch (error) {
		console.error('Error creating calendar event:', error)
		throw new Error('Failed to create calendar event')
	}
}

/**
 * Obtener eventos de calendario para una granja
 */
export function subscribeToCalendarEvents(
	farmUuid: string,
	callback: (events: CalendarEvent[]) => void
): () => void {
	const q = query(collection(firestore, COLLECTION), where('farmUuid', '==', farmUuid))

	return onSnapshot(
		q,
		(snapshot) => {
			const events: CalendarEvent[] = []

			snapshot.forEach((doc) => {
				const data = doc.data()
				events.push({
					uuid: doc.id,
					title: data.title,
					description: data.description,
					date: data.date,
					time: data.time,
					type: data.type,
					priority: data.priority,
					status: data.status,
					farmUuid: data.farmUuid,
					animalId: data.animalUuid,
					relatedUuid: data.relatedId,
					createdBy: data.createdBy,
					createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
					updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
				})
			})

			// Ordenar por fecha y hora
			const sortedEvents = events.sort((a, b) => {
				const dateA = dayjs(`${a.date} ${a.time || '00:00'}`)
				const dateB = dayjs(`${b.date} ${b.time || '00:00'}`)
				return dateA.isBefore(dateB) ? -1 : 1
			})

			callback(sortedEvents)
		},
		(error) => {
			console.error('Error listening to calendar events:', error)
			callback([])
		}
	)
}

/**
 * Actualizar evento de calendario
 */
export async function updateCalendarEvent(
	eventId: string,
	updates: Partial<CalendarEvent>
): Promise<void> {
	try {
		const docRef = doc(firestore, COLLECTION, eventId)
		await updateDoc(docRef, {
			...updates,
			updatedAt: serverTimestamp(),
		})
	} catch (error) {
		console.error('Error updating calendar event:', error)
		throw new Error('Failed to update calendar event')
	}
}

/**
 * Eliminar evento de calendario
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
	try {
		const docRef = doc(firestore, COLLECTION, eventId)
		await deleteDoc(docRef)
	} catch (error) {
		console.error('Error deleting calendar event:', error)
		throw new Error('Failed to delete calendar event')
	}
}

/**
 * Marcar evento como completado
 */
export async function completeCalendarEvent(eventId: string): Promise<void> {
	try {
		await updateCalendarEvent(eventId, { status: 'completed' })
	} catch (error) {
		console.error('Error completing calendar event:', error)
		throw new Error('Failed to complete calendar event')
	}
}

/**
 * Obtener eventos para un rango de fechas
 */
export async function getEventsForDateRange(
	farmUuid: string,
	startDate: string,
	endDate: string
): Promise<CalendarEvent[]> {
	try {
		const q = query(
			collection(firestore, COLLECTION),
			where('farmUuid', '==', farmUuid),
			where('date', '>=', startDate),
			where('date', '<=', endDate)
		)

		const snapshot = await getDocs(q)
		const events: CalendarEvent[] = []

		snapshot.forEach((doc) => {
			const data = doc.data()
			events.push({
				uuid: doc.id,
				title: data.title,
				description: data.description,
				date: data.date,
				time: data.time,
				type: data.type,
				priority: data.priority,
				status: data.status,
				farmUuid: data.farmUuid,
				animalId: data.animalUuid,
				relatedUuid: data.relatedId,
				createdBy: data.createdBy,
				createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
				updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
			})
		})

		return events.sort((a, b) => {
			const dateA = dayjs(`${a.date} ${a.time || '00:00'}`)
			const dateB = dayjs(`${b.date} ${b.time || '00:00'}`)
			return dateA.isBefore(dateB) ? -1 : 1
		})
	} catch (error) {
		console.error('Error getting events for date range:', error)
		return []
	}
}

/**
 * Limpiar eventos antiguos (más de 6 meses)
 */
export async function cleanupOldEvents(farmUuid: string): Promise<number> {
	try {
		const sixMonthsAgo = dayjs().subtract(6, 'months').format('YYYY-MM-DD')

		const q = query(
			collection(firestore, COLLECTION),
			where('farmUuid', '==', farmUuid),
			where('date', '<', sixMonthsAgo),
			where('status', '==', 'completed')
		)

		const snapshot = await getDocs(q)
		const batch = writeBatch(firestore)

		snapshot.forEach((doc) => {
			batch.delete(doc.ref)
		})

		await batch.commit()
		return snapshot.size
	} catch (error) {
		console.error('Error cleaning up old events:', error)
		return 0
	}
}

/**
 * Obtener estadísticas de eventos para una granja
 */
export async function getCalendarStats(farmUuid: string): Promise<{
	total: number
	pending: number
	completed: number
	overdue: number
	byType: Record<string, number>
	byPriority: Record<string, number>
}> {
	try {
		const q = query(collection(firestore, COLLECTION), where('farmUuid', '==', farmUuid))
		const snapshot = await getDocs(q)

		const stats = {
			total: 0,
			pending: 0,
			completed: 0,
			overdue: 0,
			byType: {} as Record<string, number>,
			byPriority: {} as Record<string, number>,
		}

		const today = dayjs().format('YYYY-MM-DD')

		snapshot.forEach((doc) => {
			const data = doc.data()
			stats.total++

			// Contar por estado
			if (data.status === 'pending') {
				stats.pending++
				if (data.date < today) {
					stats.overdue++
				}
			} else if (data.status === 'completed') {
				stats.completed++
			}

			// Contar por tipo
			const type = data.type || 'general'
			stats.byType[type] = (stats.byType[type] || 0) + 1

			// Contar por prioridad
			const priority = data.priority || 'medium'
			stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1
		})

		return stats
	} catch (error) {
		console.error('Error getting calendar stats:', error)
		return {
			total: 0,
			pending: 0,
			completed: 0,
			overdue: 0,
			byType: {},
			byPriority: {},
		}
	}
}

/**
 * Crear múltiples eventos (para medicaciones recurrentes)
 */
export async function createRecurringEvents(
	baseEvent: Omit<CalendarEvent, 'uuid' | 'createdAt' | 'updatedAt'>,
	dates: string[]
): Promise<string[]> {
	try {
		const batch = writeBatch(firestore)
		const eventIds: string[] = []

		dates.forEach((date) => {
			const docRef = doc(collection(firestore, COLLECTION))
			eventIds.push(docRef.id)

			batch.set(docRef, {
				...baseEvent,
				date,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			})
		})

		await batch.commit()
		return eventIds
	} catch (error) {
		console.error('Error creating recurring events:', error)
		throw new Error('Failed to create recurring events')
	}
}

// Objeto para mantener compatibilidad
export const CalendarService = {
	createCalendarEvent,
	subscribeToCalendarEvents,
	updateCalendarEvent,
	deleteCalendarEvent,
	completeCalendarEvent,
	getEventsForDateRange,
	cleanupOldEvents,
	getCalendarStats,
	createRecurringEvents,
}
