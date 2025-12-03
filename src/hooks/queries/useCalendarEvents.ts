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

		// OPTIMISTIC UPDATE
		onMutate: async ({ eventData }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: CALENDAR_KEYS.all })

			// Snapshot the previous value
			const previousEvents: Array<{ queryKey: unknown[]; data: unknown }> = []
			queryClient.getQueriesData({ queryKey: CALENDAR_KEYS.all }).forEach(([queryKey, data]) => {
				previousEvents.push({ queryKey: queryKey as unknown[], data })
			})

			// Create optimistic event
			const optimisticEvent: CalendarEvent = {
				...eventData,
				uuid: `temp-${Date.now()}`,
				farmUuid: farm?.uuid || '',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				createdBy: 'user-placeholder', // We might not have this easily, but it's okay for display
			}

			// Optimistically update all calendar queries
			queryClient.setQueriesData(
				{ queryKey: CALENDAR_KEYS.all },
				(old: CalendarEvent[] | undefined) => {
					if (!old || !Array.isArray(old)) return old
					return [...old, optimisticEvent]
				}
			)

			return { previousEvents, optimisticEvent }
		},

		// SUCCESS: Replace temporary ID
		onSuccess: (data, _variables, context) => {
			if (context?.optimisticEvent && data?.uuid) {
				queryClient.setQueriesData(
					{ queryKey: CALENDAR_KEYS.all },
					(old: CalendarEvent[] | undefined) => {
						if (!old || !Array.isArray(old)) return old
						return old.map((e) => (e.uuid === context.optimisticEvent.uuid ? data : e))
					}
				)
			}
		},

		// ROLLBACK
		onError: (_err, _variables, context) => {
			if (context?.previousEvents) {
				context.previousEvents.forEach(({ queryKey, data }) => {
					queryClient.setQueryData(queryKey as unknown[], data)
				})
			}
		},

		// SYNC
		onSettled: () => {
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

		// OPTIMISTIC UPDATE
		onMutate: async ({ eventData }) => {
			await queryClient.cancelQueries({ queryKey: CALENDAR_KEYS.all })

			const previousEvents: Array<{ queryKey: unknown[]; data: unknown }> = []
			queryClient.getQueriesData({ queryKey: CALENDAR_KEYS.all }).forEach(([queryKey, data]) => {
				previousEvents.push({ queryKey: queryKey as unknown[], data })
			})

			queryClient.setQueriesData(
				{ queryKey: CALENDAR_KEYS.all },
				(old: CalendarEvent[] | undefined) => {
					if (!old || !Array.isArray(old)) return old
					return old.map((e) => (e.uuid === eventData.uuid ? { ...e, ...eventData } : e))
				}
			)

			return { previousEvents }
		},

		onError: (_err, _variables, context) => {
			if (context?.previousEvents) {
				context.previousEvents.forEach(({ queryKey, data }) => {
					queryClient.setQueryData(queryKey as unknown[], data)
				})
			}
		},

		onSettled: () => {
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

		// OPTIMISTIC UPDATE
		onMutate: async ({ eventUuid, status }) => {
			await queryClient.cancelQueries({ queryKey: CALENDAR_KEYS.all })

			const previousEvents: Array<{ queryKey: unknown[]; data: unknown }> = []
			queryClient.getQueriesData({ queryKey: CALENDAR_KEYS.all }).forEach(([queryKey, data]) => {
				previousEvents.push({ queryKey: queryKey as unknown[], data })
			})

			queryClient.setQueriesData(
				{ queryKey: CALENDAR_KEYS.all },
				(old: CalendarEvent[] | undefined) => {
					if (!old || !Array.isArray(old)) return old
					return old.map((e) => (e.uuid === eventUuid ? { ...e, status } : e))
				}
			)

			return { previousEvents }
		},

		onError: (_err, _variables, context) => {
			if (context?.previousEvents) {
				context.previousEvents.forEach(({ queryKey, data }) => {
					queryClient.setQueryData(queryKey as unknown[], data)
				})
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.all })
		},
	})
}

export const useDeleteCalendarEvent = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ eventUuid, userUuid }: { eventUuid: string; userUuid: string }) =>
			CalendarService.deleteCalendarEvent(eventUuid, userUuid),

		// OPTIMISTIC UPDATE
		onMutate: async ({ eventUuid }) => {
			await queryClient.cancelQueries({ queryKey: CALENDAR_KEYS.all })

			const previousEvents: Array<{ queryKey: unknown[]; data: unknown }> = []
			queryClient.getQueriesData({ queryKey: CALENDAR_KEYS.all }).forEach(([queryKey, data]) => {
				previousEvents.push({ queryKey: queryKey as unknown[], data })
			})

			queryClient.setQueriesData(
				{ queryKey: CALENDAR_KEYS.all },
				(old: CalendarEvent[] | undefined) => {
					if (!old || !Array.isArray(old)) return old
					return old.filter((e) => e.uuid !== eventUuid)
				}
			)

			return { previousEvents }
		},

		onError: (_err, _variables, context) => {
			if (context?.previousEvents) {
				context.previousEvents.forEach(({ queryKey, data }) => {
					queryClient.setQueryData(queryKey as unknown[], data)
				})
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: CALENDAR_KEYS.all })
		},
	})
}
