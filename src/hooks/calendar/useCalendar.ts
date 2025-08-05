import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { CalendarService } from '@/services/calendar/calendarService'

export const useCalendar = () => {
	const { farm } = useFarmStore()
	const { user } = useUserStore()
	const [events, setEvents] = useState<CalendarEvent[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'))
	const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(dayjs())

	// Suscribirse a eventos en tiempo real
	useEffect(() => {
		if (!farm?.uuid) {
			setEvents([])
			return
		}

		setLoading(true)
		setError(null)

		const unsubscribe = CalendarService.subscribeToCalendarEvents(farm.uuid, (newEvents) => {
			setEvents(newEvents)
			setLoading(false)
			setError(null)
		})

		return () => {
			unsubscribe()
		}
	}, [farm?.uuid])

	// Obtener eventos para una fecha específica
	const getEventsForDate = useCallback(
		(date: string) => {
			return events.filter((event) => event.date === date)
		},
		[events]
	)

	// Obtener eventos para el mes actual
	const getEventsForMonth = useCallback(
		(month: dayjs.Dayjs) => {
			const startOfMonth = month.startOf('month').format('YYYY-MM-DD')
			const endOfMonth = month.endOf('month').format('YYYY-MM-DD')

			return events.filter((event) => {
				return event.date >= startOfMonth && event.date <= endOfMonth
			})
		},
		[events]
	)

	// Obtener eventos pendientes
	const getPendingEvents = useCallback(() => {
		const today = dayjs().format('YYYY-MM-DD')
		return events.filter((event) => event.status === 'pending' && event.date >= today)
	}, [events])

	// Obtener eventos vencidos
	const getOverdueEvents = useCallback(() => {
		const today = dayjs().format('YYYY-MM-DD')
		return events.filter((event) => event.status === 'pending' && event.date < today)
	}, [events])

	// Obtener eventos por tipo
	const getEventsByType = useCallback(
		(type: CalendarEvent['type']) => {
			return events.filter((event) => event.type === type)
		},
		[events]
	)

	// Crear evento
	const createEvent = useCallback(
		async (
			eventData: Omit<CalendarEvent, 'uuid' | 'createdAt' | 'updatedAt' | 'farmUuid' | 'createdBy'>
		) => {
			if (!farm?.uuid || !user?.uuid) return

			try {
				return await CalendarService.createCalendarEvent({
					...eventData,
					farmUuid: farm.uuid,
					createdBy: user.uuid,
				})
			} catch (err) {
				console.error('Error creating calendar event:', err)
				setError('Error al crear evento')
			}
		},
		[farm?.uuid, user?.uuid]
	)

	// Actualizar evento
	const updateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEvent>) => {
		try {
			await CalendarService.updateCalendarEvent(eventId, updates)
		} catch (err) {
			console.error('Error updating calendar event:', err)
			setError('Error al actualizar evento')
		}
	}, [])

	// Eliminar evento
	const deleteEvent = useCallback(async (eventId: string) => {
		try {
			await CalendarService.deleteCalendarEvent(eventId)
		} catch (err) {
			console.error('Error deleting calendar event:', err)
			setError('Error al eliminar evento')
		}
	}, [])

	// Completar evento
	const completeEvent = useCallback(async (eventId: string) => {
		try {
			await CalendarService.completeCalendarEvent(eventId)
		} catch (err) {
			console.error('Error completing calendar event:', err)
			setError('Error al completar evento')
		}
	}, [])

	// Navegar entre meses
	const goToNextMonth = useCallback(() => {
		setCurrentMonth((prev) => prev.add(1, 'month'))
	}, [])

	const goToPreviousMonth = useCallback(() => {
		setCurrentMonth((prev) => prev.subtract(1, 'month'))
	}, [])

	const goToToday = useCallback(() => {
		const today = dayjs()
		setCurrentMonth(today)
		setSelectedDate(today.format('YYYY-MM-DD'))
	}, [])

	// Generar estructura del calendario para el mes actual
	const getCalendarMonth = useCallback((): CalendarMonth => {
		const startOfMonth = currentMonth.startOf('month')
		const endOfMonth = currentMonth.endOf('month')
		const startOfCalendar = startOfMonth.startOf('week')
		const endOfCalendar = endOfMonth.endOf('week')

		const days: CalendarDay[] = []
		let current = startOfCalendar

		while (current.isBefore(endOfCalendar) || current.isSame(endOfCalendar, 'day')) {
			const dateStr = current.format('YYYY-MM-DD')
			const dayEvents = getEventsForDate(dateStr)

			days.push({
				date: dateStr,
				events: dayEvents,
				isToday: current.isSame(dayjs(), 'day'),
				isCurrentMonth: current.isSame(currentMonth, 'month'),
			})

			current = current.add(1, 'day')
		}

		return {
			year: currentMonth.year(),
			month: currentMonth.month(),
			days,
		}
	}, [currentMonth, getEventsForDate])

	// Estadísticas
	const getStats = useCallback(() => {
		const today = dayjs().format('YYYY-MM-DD')
		const pending = events.filter((e) => e.status === 'pending').length
		const overdue = events.filter((e) => e.status === 'pending' && e.date < today).length
		const completed = events.filter((e) => e.status === 'completed').length
		const todayEvents = getEventsForDate(today).length

		return {
			total: events.length,
			pending,
			overdue,
			completed,
			todayEvents,
		}
	}, [events, getEventsForDate])

	return {
		// Datos
		events,
		loading,
		error,
		selectedDate,
		currentMonth,

		// Acciones de navegación
		setSelectedDate,
		goToNextMonth,
		goToPreviousMonth,
		goToToday,

		// Acciones de eventos
		createEvent,
		updateEvent,
		deleteEvent,
		completeEvent,

		// Consultas
		getEventsForDate,
		getEventsForMonth,
		getPendingEvents,
		getOverdueEvents,
		getEventsByType,
		getCalendarMonth,
		getStats,
	}
}
