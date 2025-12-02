import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useFarmStore } from '@/store/useFarmStore'

import { CalendarService } from '@/services/calendar'

export const CALENDAR_KEYS = {
	all: ['calendar'] as const,
	events: (farmUuid: string, startDate?: string, endDate?: string) =>
		[...CALENDAR_KEYS.all, 'events', farmUuid, startDate, endDate] as const,
}

export const useCalendarEvents = (startDate?: string, endDate?: string) => {
	const { farm } = useFarmStore()
	const farmUuid = farm?.uuid || ''

	return useQuery({
		queryKey: CALENDAR_KEYS.events(farmUuid, startDate, endDate),
		queryFn: () => CalendarService.getCalendarEvents(farmUuid, startDate, endDate),
		enabled: !!farmUuid && !!startDate && !!endDate,
	})
}

export const useCreateCalendarEvent = () => {
	const queryClient = useQueryClient()
	const { farm } = useFarmStore()

	return useMutation({
		mutationFn: ({
			eventData,
			userUuid,
		}: {
			eventData: Omit<CalendarEvent, 'uuid' | 'createdAt' | 'updatedAt' | 'farmUuid' | 'createdBy'>
			userUuid: string
		}) => CalendarService.createCalendarEvent(eventData, userUuid, farm?.uuid || ''),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.all })
		},
	})
}

export const useUpdateCalendarEvent = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			eventData,
			userUuid,
		}: {
			eventData: Partial<CalendarEvent> & { uuid: string }
			userUuid: string
		}) => CalendarService.updateCalendarEvent(eventData, userUuid),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.all })
		},
	})
}

export const useUpdateCalendarEventStatus = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			eventUuid,
			status,
			userUuid,
		}: {
			eventUuid: string
			status: CalendarEvent['status']
			userUuid: string
		}) => CalendarService.updateCalendarEventStatus(eventUuid, status, userUuid),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.all })
		},
	})
}

export const useDeleteCalendarEvent = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ eventUuid, userUuid }: { eventUuid: string; userUuid: string }) =>
			CalendarService.deleteCalendarEvent(eventUuid, userUuid),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.all })
		},
	})
}
