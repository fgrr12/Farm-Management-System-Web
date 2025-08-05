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

const COLLECTION = 'calendar_events'

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
					animalUuid: data.animalUuid,
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
				animalUuid: data.animalUuid,
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

// Objeto para mantener compatibilidad
export const CalendarService = {
	createCalendarEvent,
	subscribeToCalendarEvents,
	updateCalendarEvent,
	deleteCalendarEvent,
	completeCalendarEvent,
	getEventsForDateRange,
	cleanupOldEvents,
}
