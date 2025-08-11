import { callableFireFunction } from '@/utils/callableFireFunction'

const getCalendarEvents = async (farmUuid: string, startDate?: string, endDate?: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any[]; count: number }>(
		'calendar',
		{
			operation: 'getCalendarEvents',
			farmUuid,
			startDate,
			endDate,
		}
	)
	return response.data
}

const getCalendarEventByUuid = async (eventUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('calendar', {
		operation: 'getCalendarEventByUuid',
		eventUuid,
	})
	return response.data
}

const createCalendarEvent = async (
	event: any,
	userUuid: string,
	farmUuid: string
): Promise<{ uuid: string; isNew: boolean }> => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('calendar', {
		operation: 'upsertCalendarEvent',
		event: { ...event, uuid: undefined }, // Remove uuid for new events
		userUuid,
		farmUuid,
	})
	return response.data
}

const updateCalendarEvent = async (event: any, userUuid: string, farmUuid: string) => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('calendar', {
		operation: 'upsertCalendarEvent',
		event,
		userUuid,
		farmUuid,
	})
	return response.data
}

const deleteCalendarEvent = async (eventUuid: string, userUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('calendar', {
		operation: 'deleteCalendarEvent',
		eventUuid,
		userUuid,
	})
	return response
}

const getAnimalEvents = async (animalUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any[]; count: number }>(
		'calendar',
		{
			operation: 'getAnimalEvents',
			animalUuid,
		}
	)
	return response.data
}

const createHealthRecordEvents = async (healthRecord: any, farmUuid: string, userUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('calendar', {
		operation: 'createHealthRecordEvents',
		healthRecord,
		farmUuid,
		userUuid,
	})
	return response
}

const updateAnimalHealthEvents = async (
	animalUuid: string,
	oldStatus: string,
	newStatus: string
) => {
	const response = await callableFireFunction<{ success: boolean }>('calendar', {
		operation: 'updateAnimalHealthEvents',
		animalUuid,
		oldStatus,
		newStatus,
	})
	return response
}

export const CalendarService = {
	getCalendarEvents,
	getCalendarEventByUuid,
	createCalendarEvent,
	updateCalendarEvent,
	deleteCalendarEvent,
	getAnimalEvents,
	createHealthRecordEvents,
	updateAnimalHealthEvents,
}
