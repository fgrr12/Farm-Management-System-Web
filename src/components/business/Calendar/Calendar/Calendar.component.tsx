import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)

import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCalendar } from '@/hooks/calendar/useCalendar'

import { CalendarEvent } from '../CalendarEvent'
import { CalendarEventModal } from '../CalendarEventModal'
import { CalendarFilters } from '../CalendarFilters'

export const Calendar = memo(() => {
	const { t } = useTranslation(['calendar'])
	const [currentDate, setCurrentDate] = useState(dayjs())
	const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
	const [showEventModal, setShowEventModal] = useState(false)
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
	const [_viewMode, _setViewMode] = useState<'month' | 'week' | 'day'>('month')
	const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])

	const { events, loading, error, createEvent, updateEvent, deleteEvent } = useCalendar()

	// Generar días del mes actual
	const monthDays = useMemo(() => {
		const startOfMonth = currentDate.startOf('month')
		const endOfMonth = currentDate.endOf('month')
		const startOfWeek = startOfMonth.startOf('week')
		const endOfWeek = endOfMonth.endOf('week')

		const days = []
		let current = startOfWeek

		while (current.isBefore(endOfWeek) || current.isSame(endOfWeek, 'day')) {
			days.push(current)
			current = current.add(1, 'day')
		}

		return days
	}, [currentDate])

	// Obtener eventos para el rango visible
	const visibleEvents = useMemo(() => {
		const startDate = monthDays[0]
		const endDate = monthDays[monthDays.length - 1]

		return events
			.filter((event: CalendarEvent) => {
				const eventDate = dayjs(event.date)
				return eventDate.isBetween(startDate, endDate, 'day', '[]')
			})
			.filter((event: CalendarEvent) => {
				if (selectedCategories.includes('all')) return true
				return selectedCategories.includes(event.type)
			})
	}, [monthDays, events, selectedCategories])

	// Obtener eventos para un día específico
	const getEventsForDay = useCallback(
		(day: dayjs.Dayjs) => {
			return visibleEvents.filter((event: CalendarEvent) => {
				const eventDate = dayjs(event.date)
				return eventDate.isSame(day, 'day')
			})
		},
		[visibleEvents]
	)

	// Navegación del calendario
	const navigateMonth = useCallback((direction: 'prev' | 'next') => {
		setCurrentDate((prev) =>
			direction === 'prev' ? prev.subtract(1, 'month') : prev.add(1, 'month')
		)
	}, [])

	const goToToday = useCallback(() => {
		setCurrentDate(dayjs())
	}, [])

	// Manejo de eventos
	const handleDayClick = useCallback((day: dayjs.Dayjs) => {
		setSelectedDate(day)
		setSelectedEvent(null)
		setShowEventModal(true)
	}, [])

	const handleEventClick = useCallback((event: CalendarEvent) => {
		setSelectedEvent(event)
		setSelectedDate(dayjs(event.date))
		setShowEventModal(true)
	}, [])

	const handleCreateEvent = useCallback(
		async (
			eventData: Omit<CalendarEvent, 'uuid' | 'createdAt' | 'farmUuid' | 'updatedAt' | 'createdBy'>
		) => {
			try {
				await createEvent(eventData)
				setShowEventModal(false)
				setSelectedEvent(null)
				setSelectedDate(null)
			} catch (error) {
				console.error('Error creating event:', error)
			}
		},
		[createEvent]
	)

	const handleUpdateEvent = useCallback(
		async (eventData: CalendarEvent) => {
			try {
				await updateEvent(eventData.uuid, eventData)
				setShowEventModal(false)
				setSelectedEvent(null)
				setSelectedDate(null)
			} catch (error) {
				console.error('Error updating event:', error)
			}
		},
		[updateEvent]
	)

	const handleDeleteEvent = useCallback(
		async (eventId: string) => {
			try {
				await deleteEvent(eventId)
				setShowEventModal(false)
				setSelectedEvent(null)
				setSelectedDate(null)
			} catch (error) {
				console.error('Error deleting event:', error)
			}
		},
		[deleteEvent]
	)

	// Obtener el color de fondo para un día
	const getDayBackgroundColor = useCallback(
		(day: dayjs.Dayjs) => {
			const dayEvents = getEventsForDay(day)
			if (dayEvents.length === 0) return ''

			// Priorizar por tipo de evento
			const hasUrgent = dayEvents.some(
				(e: CalendarEvent) => e.priority === 'high' || e.type === 'medication'
			)
			const hasImportant = dayEvents.some(
				(e: CalendarEvent) => e.priority === 'medium' || e.type === 'vaccination'
			)

			if (hasUrgent) return 'bg-red-50 border-red-200'
			if (hasImportant) return 'bg-yellow-50 border-yellow-200'
			return 'bg-blue-50 border-blue-200'
		},
		[getEventsForDay]
	)

	if (error) {
		return (
			<div className="p-6 bg-red-50 border border-red-200 rounded-lg">
				<p className="text-red-800">{t('error.loadingEvents')}</p>
			</div>
		)
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
			{/* Header del calendario */}
			<div className="p-4 border-b border-gray-200 dark:border-gray-700">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-4">
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
							{currentDate.format('MMMM YYYY')}
						</h2>
						<div className="flex items-center space-x-2">
							<button
								type="button"
								onClick={() => navigateMonth('prev')}
								className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
							>
								<div className="i-heroicons-chevron-left w-5 h-5" />
							</button>
							<button
								type="button"
								onClick={goToToday}
								className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
							>
								{t('today')}
							</button>
							<button
								type="button"
								onClick={() => navigateMonth('next')}
								className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
							>
								<div className="i-heroicons-chevron-right w-5 h-5" />
							</button>
						</div>
					</div>

					<div className="flex items-center space-x-3">
						<button
							type="button"
							onClick={() => {
								setSelectedDate(dayjs())
								setSelectedEvent(null)
								setShowEventModal(true)
							}}
							className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							<div className="i-heroicons-plus w-4 h-4" />
							<span>{t('createEvent')}</span>
						</button>
					</div>
				</div>

				{/* Filtros */}
				<CalendarFilters
					selectedCategories={selectedCategories}
					onCategoriesChange={setSelectedCategories}
				/>
			</div>

			{/* Días de la semana */}
			<div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
				{['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
					<div
						key={day}
						className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700"
					>
						{day}
					</div>
				))}
			</div>

			{/* Grid del calendario */}
			<div className="grid grid-cols-7">
				{monthDays.map((day) => {
					const dayEvents = getEventsForDay(day)
					const isCurrentMonth = day.month() === currentDate.month()
					const isToday = day.isSame(dayjs(), 'day')
					const isSelected = selectedDate?.isSame(day, 'day')

					return (
						<div
							key={day.format('YYYY-MM-DD')}
							role="button"
							tabIndex={0}
							className={`
								min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer
								hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
								${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800 text-gray-400' : ''}
								${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
								${isSelected ? 'ring-2 ring-blue-500' : ''}
								${getDayBackgroundColor(day)}
							`}
							onClick={() => handleDayClick(day)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault()
									handleDayClick(day)
								}
							}}
						>
							{/* Número del día */}
							<div className="flex items-center justify-between mb-1">
								<span
									className={`
										text-sm font-medium
										${isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
										${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900 dark:text-white'}
									`}
								>
									{day.date()}
								</span>
								{dayEvents.length > 0 && (
									<span className="text-xs text-gray-500 dark:text-gray-400">
										{dayEvents.length}
									</span>
								)}
							</div>

							{/* Eventos del día */}
							<div className="space-y-1">
								{dayEvents.slice(0, 3).map((event: CalendarEvent) => (
									<CalendarEvent
										key={event.uuid}
										event={event}
										onClick={(e) => {
											e.stopPropagation()
											handleEventClick(event)
										}}
										compact
									/>
								))}
								{dayEvents.length > 3 && (
									<div className="text-xs text-gray-500 dark:text-gray-400 text-center">
										+{dayEvents.length - 3} más
									</div>
								)}
							</div>
						</div>
					)
				})}
			</div>

			{/* Loading overlay */}
			{loading && (
				<div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
				</div>
			)}

			{/* Modal de evento */}
			{showEventModal && (
				<CalendarEventModal
					isOpen={showEventModal}
					onClose={() => {
						setShowEventModal(false)
						setSelectedEvent(null)
						setSelectedDate(null)
					}}
					event={selectedEvent}
					selectedDate={selectedDate}
					onSave={
						selectedEvent
							? (eventData: any) => handleUpdateEvent(eventData as CalendarEvent)
							: (eventData: any) => handleCreateEvent(eventData)
					}
					onDelete={selectedEvent ? () => handleDeleteEvent(selectedEvent.uuid) : undefined}
				/>
			)}
		</div>
	)
})
