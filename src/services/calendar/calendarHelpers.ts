import dayjs from 'dayjs'

import { createCalendarEvent } from './calendarService'

/**
 * Generar evento de calendario desde una notificación de medicación
 */
export async function createMedicationEvent(
	farmUuid: string,
	animalUuid: string,
	medication: string,
	dosage: string,
	scheduledDate: Date,
	createdBy: string
): Promise<string> {
	const event: Omit<CalendarEvent, 'uuid' | 'createdAt' | 'updatedAt'> = {
		title: `Medicación: ${medication}`,
		description: `Administrar ${medication} - ${dosage}`,
		date: dayjs(scheduledDate).format('YYYY-MM-DD'),
		time: dayjs(scheduledDate).format('HH:mm'),
		type: 'medication',
		priority: 'high',
		status: 'pending',
		farmUuid,
		animalId: animalUuid,
		createdBy,
	}

	return await createCalendarEvent(event)
}

/**
 * Generar evento de calendario desde una notificación de vacunación
 */
export async function createVaccinationEvent(
	farmUuid: string,
	animalUuid: string,
	vaccineName: string,
	scheduledDate: Date,
	createdBy: string
): Promise<string> {
	const event: Omit<CalendarEvent, 'uuid' | 'createdAt' | 'updatedAt'> = {
		title: `Vacunación: ${vaccineName}`,
		description: `Aplicar vacuna ${vaccineName}`,
		date: dayjs(scheduledDate).format('YYYY-MM-DD'),
		time: dayjs(scheduledDate).format('HH:mm'),
		type: 'vaccination',
		priority: 'high',
		status: 'pending',
		farmUuid,
		animalId: animalUuid,
		createdBy,
	}

	return await createCalendarEvent(event)
}

/**
 * Generar evento de calendario desde una tarea
 */
export async function createTaskEvent(
	farmUuid: string,
	taskTitle: string,
	taskDescription: string,
	dueDate: Date,
	priority: CalendarEvent['priority'],
	createdBy: string,
	taskId?: string
): Promise<string> {
	const event: Omit<CalendarEvent, 'uuid' | 'createdAt' | 'updatedAt'> = {
		title: `Tarea: ${taskTitle}`,
		description: taskDescription,
		date: dayjs(dueDate).format('YYYY-MM-DD'),
		time: dayjs(dueDate).format('HH:mm'),
		type: 'task',
		priority,
		status: 'pending',
		farmUuid,
		relatedUuid: taskId,
		createdBy,
	}

	return await createCalendarEvent(event)
}

/**
 * Generar evento de cita veterinaria
 */
export async function createAppointmentEvent(
	farmUuid: string,
	animalUuid: string,
	appointmentType: string,
	scheduledDate: Date,
	description: string,
	createdBy: string
): Promise<string> {
	const event: Omit<CalendarEvent, 'uuid' | 'createdAt' | 'updatedAt'> = {
		title: `Cita: ${appointmentType}`,
		description,
		date: dayjs(scheduledDate).format('YYYY-MM-DD'),
		time: dayjs(scheduledDate).format('HH:mm'),
		type: 'appointment',
		priority: 'medium',
		status: 'pending',
		farmUuid,
		animalId: animalUuid,
		createdBy,
	}

	return await createCalendarEvent(event)
}

/**
 * Generar eventos recurrentes de medicación
 */
export async function createRecurringMedicationEvents(
	farmUuid: string,
	animalUuid: string,
	medication: string,
	dosage: string,
	startDate: Date,
	frequency: string, // "daily", "twice_daily", "weekly", etc.
	duration: number, // días
	createdBy: string
): Promise<string[]> {
	const eventIds: string[] = []
	const start = dayjs(startDate)

	// Calcular intervalos basados en la frecuencia
	let intervalHours = 24 // Por defecto diario
	let timesPerDay = 1

	switch (frequency.toLowerCase()) {
		case 'twice_daily':
			intervalHours = 12
			timesPerDay = 2
			break
		case 'three_times_daily':
			intervalHours = 8
			timesPerDay = 3
			break
		case 'four_times_daily':
			intervalHours = 6
			timesPerDay = 4
			break
		case 'weekly':
			intervalHours = 24 * 7
			break
		default:
			intervalHours = 24
			break
	}

	// Generar eventos para la duración especificada
	for (let day = 0; day < duration; day++) {
		for (let dose = 0; dose < timesPerDay; dose++) {
			const eventDate = start.add(day, 'days').add(dose * intervalHours, 'hours')

			try {
				const eventId = await createMedicationEvent(
					farmUuid,
					animalUuid,
					medication,
					dosage,
					eventDate.toDate(),
					createdBy
				)
				eventIds.push(eventId)
			} catch (error) {
				console.error('Error creating recurring medication event:', error)
			}
		}
	}

	return eventIds
}

/**
 * Integrar con notificaciones - crear evento cuando se crea una notificación
 */
export async function createEventFromNotification(
	notification: NotificationData,
	createdBy: string
): Promise<string | null> {
	try {
		let event: Omit<CalendarEvent, 'uuid' | 'createdAt' | 'updatedAt'>

		switch (notification.category) {
			case 'medication':
				event = {
					title: notification.title,
					description: notification.message,
					date: dayjs().format('YYYY-MM-DD'),
					time: dayjs().format('HH:mm'),
					type: 'medication',
					priority: notification.priority === 'critical' ? 'critical' : 'high',
					status: 'pending',
					farmUuid: notification.farmUuid,
					animalId: notification.animalUuid,
					createdBy,
				}
				break

			case 'health':
				event = {
					title: notification.title,
					description: notification.message,
					date: dayjs().format('YYYY-MM-DD'),
					time: dayjs().format('HH:mm'),
					type: 'appointment',
					priority: notification.priority || 'medium',
					status: 'pending',
					farmUuid: notification.farmUuid,
					animalId: notification.animalUuid,
					createdBy,
				}
				break

			case 'task':
				event = {
					title: notification.title,
					description: notification.message,
					date: dayjs().format('YYYY-MM-DD'),
					time: dayjs().format('HH:mm'),
					type: 'task',
					priority: notification.priority || 'medium',
					status: 'pending',
					farmUuid: notification.farmUuid,
					createdBy,
				}
				break

			default:
				return null
		}

		return await createCalendarEvent(event)
	} catch (error) {
		console.error('Error creating event from notification:', error)
		return null
	}
}

// Objeto para mantener compatibilidad
export const CalendarHelpers = {
	createMedicationEvent,
	createVaccinationEvent,
	createTaskEvent,
	createAppointmentEvent,
	createRecurringMedicationEvents,
	createEventFromNotification,
}
