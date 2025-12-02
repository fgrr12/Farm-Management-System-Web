import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import localeData from 'dayjs/plugin/localeData'
import 'dayjs/locale/es'

dayjs.extend(isBetween)
dayjs.extend(localeData)
dayjs.locale('es')

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import {
	useCalendarEvents,
	useCreateCalendarEvent,
	useDeleteCalendarEvent,
	useUpdateCalendarEvent,
} from '@/hooks/queries/useCalendarEvents'

import { CalendarEvent as CalendarEventComponent } from '../CalendarEvent'
import { CalendarEventModal } from '../CalendarEventModal'
import { CalendarFilters } from '../CalendarFilters'

export const Calendar = memo(() => {
	const { t } = useTranslation(['calendar'])
	const { user } = useUserStore()
	const { farm } = useFarmStore()

	// State
	const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(dayjs())
	const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
	const [showEventModal, setShowEventModal] = useState(false)
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
	const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
	const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])
	const [hoveredDay, setHoveredDay] = useState<dayjs.Dayjs | null>(null)
	const [isAnimating, setIsAnimating] = useState(false)
	const calendarRef = useRef<HTMLDivElement>(null)

	// Queries
	const startOfMonth = currentMonth.startOf('month').format('YYYY-MM-DD')
	const endOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD')

	const {
		data: events = [],
		isLoading: loading,
		error,
	} = useCalendarEvents(startOfMonth, endOfMonth)

	// Mutations
	const createEventMutation = useCreateCalendarEvent()
	const updateEventMutation = useUpdateCalendarEvent()
	const deleteEventMutation = useDeleteCalendarEvent()

	// Use currentMonth from local state
	const currentDate = currentMonth

	// Generar días según el modo de vista
	const viewDays = useMemo(() => {
		switch (viewMode) {
			case 'day':
				return [selectedDate || currentDate]
			case 'week': {
				const startOfWeek = (selectedDate || currentDate).startOf('week')
				const days = []
				for (let i = 0; i < 7; i++) {
					days.push(startOfWeek.add(i, 'day'))
				}
				return days
			}
			default: {
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
			}
		}
	}, [currentDate, selectedDate, viewMode])

	// Obtener eventos para el rango visible
	const visibleEvents = useMemo(() => {
		const startDate = viewDays[0]
		const endDate = viewDays[viewDays.length - 1]

		return events
			.filter((event: CalendarEvent) => {
				const eventDate = dayjs(event.date)
				return eventDate.isBetween(startDate, endDate, 'day', '[]')
			})
			.filter((event: CalendarEvent) => {
				if (selectedCategories.includes('all')) return true
				return selectedCategories.includes(event.type)
			})
	}, [viewDays, events, selectedCategories])

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

	// Navigation Helpers
	const goToNextMonth = useCallback(() => {
		setCurrentMonth((prev) => prev.add(1, 'month'))
	}, [])

	const goToPreviousMonth = useCallback(() => {
		setCurrentMonth((prev) => prev.subtract(1, 'month'))
	}, [])

	const goToTodayHelper = useCallback(() => {
		const today = dayjs()
		setCurrentMonth(today)
	}, [])

	// Navegación del calendario con animación
	const navigateCalendar = useCallback(
		(direction: 'prev' | 'next') => {
			setIsAnimating(true)

			setTimeout(() => {
				if (viewMode === 'month') {
					// Limpiar la fecha seleccionada al navegar entre meses
					setSelectedDate(null)
					if (direction === 'prev') {
						goToPreviousMonth()
					} else {
						goToNextMonth()
					}
				} else if (viewMode === 'week') {
					// Para vista de semana, navegar semana por semana
					const currentViewDate = selectedDate || currentDate
					const newDate =
						direction === 'prev'
							? currentViewDate.subtract(1, 'week')
							: currentViewDate.add(1, 'week')

					setSelectedDate(newDate)

					// Si el nuevo mes es diferente, también actualizar currentMonth
					if (!newDate.isSame(currentMonth, 'month')) {
						// Usar setTimeout para evitar conflictos de estado
						setTimeout(() => {
							if (direction === 'prev') {
								goToPreviousMonth()
							} else {
								goToNextMonth()
							}
						}, 50)
					}
				} else if (viewMode === 'day') {
					// Para vista de día, navegar día por día
					const currentViewDate = selectedDate || currentDate
					const newDate =
						direction === 'prev'
							? currentViewDate.subtract(1, 'day')
							: currentViewDate.add(1, 'day')

					setSelectedDate(newDate)

					// Si el nuevo mes es diferente, también actualizar currentMonth
					if (!newDate.isSame(currentMonth, 'month')) {
						// Usar setTimeout para evitar conflictos de estado
						setTimeout(() => {
							if (direction === 'prev') {
								goToPreviousMonth()
							} else {
								goToNextMonth()
							}
						}, 50)
					}
				}
				setIsAnimating(false)
			}, 150)
		},
		[viewMode, goToNextMonth, goToPreviousMonth, currentDate, currentMonth, selectedDate]
	)

	const goToToday = useCallback(() => {
		const today = dayjs()

		if (viewMode === 'month') {
			// Para vista de mes, verificar si estamos en el mes actual
			const shouldUpdate = !currentDate.isSame(today, 'month')
			if (shouldUpdate) {
				setIsAnimating(true)
				setTimeout(() => {
					goToTodayHelper()
					setSelectedDate(null)
					setIsAnimating(false)
				}, 150)
			}
		} else {
			// Para vistas de día y semana, siempre navegar a hoy
			setIsAnimating(true)
			setTimeout(() => {
				// Si hoy está en un mes diferente, cambiar el mes
				if (!today.isSame(currentMonth, 'month')) {
					goToTodayHelper()
				}
				setSelectedDate(today)
				setIsAnimating(false)
			}, 150)
		}
	}, [currentDate, currentMonth, viewMode, goToTodayHelper])

	// Manejo de eventos mejorado
	const handleDayClick = useCallback((day: dayjs.Dayjs) => {
		// Haptic feedback en dispositivos móviles
		if ('vibrate' in navigator) {
			navigator.vibrate(10)
		}

		setSelectedDate(day)
		setSelectedEvent(null)
		setShowEventModal(true)
	}, [])

	const handleEventClick = useCallback((event: CalendarEvent, e: React.MouseEvent) => {
		e.stopPropagation()
		setSelectedEvent(event)
		setSelectedDate(dayjs(event.date))
		setShowEventModal(true)
	}, [])

	const handleCreateEvent = useCallback(
		async (
			eventData: Omit<CalendarEvent, 'uuid' | 'createdAt' | 'farmUuid' | 'updatedAt' | 'createdBy'>
		) => {
			if (!user?.uuid) return

			try {
				await createEventMutation.mutateAsync({
					eventData,
					userUuid: user.uuid,
				})
				setShowEventModal(false)
				setSelectedEvent(null)
				setSelectedDate(null)
			} catch (error) {
				console.error('Error creating event:', error)
			}
		},
		[createEventMutation, user?.uuid]
	)

	const handleUpdateEvent = useCallback(
		async (eventData: CalendarEvent) => {
			if (!user?.uuid) return

			try {
				await updateEventMutation.mutateAsync({
					eventData,
					userUuid: user.uuid,
				})
				setShowEventModal(false)
				setSelectedEvent(null)
				setSelectedDate(null)
			} catch (error) {
				console.error('Error updating event:', error)
			}
		},
		[updateEventMutation, user?.uuid]
	)

	const handleDeleteEvent = useCallback(
		async (eventId: string) => {
			if (!user?.uuid) return

			try {
				await deleteEventMutation.mutateAsync({
					eventUuid: eventId,
					userUuid: user.uuid,
				})
				setShowEventModal(false)
				setSelectedEvent(null)
				setSelectedDate(null)
			} catch (error) {
				console.error('Error deleting event:', error)
			}
		},
		[deleteEventMutation, user?.uuid]
	)

	// Obtener el estilo visual para un día
	const getDayStyles = useCallback(
		(day: dayjs.Dayjs) => {
			const dayEvents = getEventsForDay(day)
			const isCurrentPeriod =
				viewMode === 'month'
					? day.month() === currentDate.month()
					: viewMode === 'week'
						? day.isSame(currentDate, 'week')
						: day.isSame(currentDate, 'day')
			const isToday = day.isSame(dayjs(), 'day')
			const isSelected = selectedDate?.isSame(day, 'day')
			const isHovered = hoveredDay?.isSame(day, 'day')
			const isWeekend = day.day() === 0 || day.day() === 6

			// Altura dinámica según el modo de vista
			const heightClass =
				viewMode === 'day'
					? 'min-h-[200px]'
					: viewMode === 'week'
						? 'min-h-[150px]'
						: 'min-h-[100px] md:min-h-[120px]'

			let baseStyles = `
				relative ${heightClass} p-1.5 md:p-2 
				border-r border-b border-gray-200 dark:border-gray-600 
				cursor-pointer transition-all duration-200 ease-in-out
				group overflow-hidden
			`

			// Estados del día
			if (!isCurrentPeriod && viewMode === 'month') {
				baseStyles += ' bg-gray-50/50 dark:bg-gray-800/50 text-gray-400'
			} else if (isToday) {
				baseStyles +=
					' bg-linear-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-900/40 dark:via-purple-900/30 dark:to-pink-900/40 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30'
			} else if (isWeekend && isCurrentPeriod) {
				baseStyles +=
					' bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
			} else {
				baseStyles +=
					' bg-linear-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-purple-900/10'
			}

			// Hover y selección
			if (isHovered && isCurrentPeriod) {
				baseStyles +=
					' ring-2 ring-blue-400 dark:ring-blue-500 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30 transform scale-[1.02] bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
			}
			if (isSelected) {
				baseStyles +=
					' ring-2 ring-purple-500 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30 transform scale-[1.02] bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30'
			}

			// Indicadores de eventos
			if (dayEvents.length > 0) {
				const hasUrgent = dayEvents.some(
					(e: CalendarEvent) => e.priority === 'high' || e.type === 'medication'
				)
				const hasImportant = dayEvents.some(
					(e: CalendarEvent) => e.priority === 'medium' || e.type === 'checkup'
				)

				if (hasUrgent) {
					baseStyles +=
						' shadow-red-200/70 dark:shadow-red-900/50 shadow-lg border-l-2 border-l-red-400'
				} else if (hasImportant) {
					baseStyles +=
						' shadow-yellow-200/70 dark:shadow-yellow-900/50 shadow-md border-l-2 border-l-yellow-400'
				} else {
					baseStyles +=
						' shadow-blue-200/70 dark:shadow-blue-900/50 shadow-sm border-l-2 border-l-blue-400'
				}
			}

			return baseStyles
		},
		[getEventsForDay, currentDate, selectedDate, hoveredDay, viewMode]
	)

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!selectedDate) return

			switch (e.key) {
				case 'ArrowLeft':
					e.preventDefault()
					setSelectedDate((prev) => prev?.subtract(1, 'day') || null)
					break
				case 'ArrowRight':
					e.preventDefault()
					setSelectedDate((prev) => prev?.add(1, 'day') || null)
					break
				case 'ArrowUp':
					e.preventDefault()
					setSelectedDate((prev) => prev?.subtract(1, 'week') || null)
					break
				case 'ArrowDown':
					e.preventDefault()
					setSelectedDate((prev) => prev?.add(1, 'week') || null)
					break
				case 'Enter':
				case ' ':
					e.preventDefault()
					setShowEventModal(true)
					break
				case 'Escape':
					setSelectedDate(null)
					break
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [selectedDate])

	if (error) {
		return (
			<div className="p-6 bg-linear-to-r from-red-50 to-red-100 border border-red-200 rounded-xl shadow-sm">
				<div className="flex items-center space-x-3">
					<div className="shrink-0">
						<div className="i-heroicons-exclamation-triangle w-6 h-6 text-red-500" />
					</div>
					<div>
						<h3 className="text-red-800 font-medium">{t('error.title')}</h3>
						<p className="text-red-600 text-sm mt-1">{t('error.loadingEvents')}</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
			{/* Header del calendario mejorado */}
			<div className="bg-linear-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-700 dark:via-purple-900/20 dark:to-pink-900/20 p-4 border-b border-gray-200 dark:border-gray-600">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					{/* Navegación principal */}
					<div className="flex items-center justify-between lg:justify-start">
						<div className="flex items-center space-x-4">
							<h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
								{viewMode === 'day'
									? (selectedDate || currentDate).format('dddd, DD MMMM YYYY')
									: viewMode === 'week'
										? `${(selectedDate || currentDate).startOf('week').format('DD MMM')} - ${(selectedDate || currentDate).endOf('week').format('DD MMM YYYY')}`
										: currentDate.format('MMMM YYYY')}
							</h2>
							<div className="flex items-center bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-600/50 p-1">
								<button
									type="button"
									onClick={() => navigateCalendar('prev')}
									className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-all duration-200"
									disabled={isAnimating}
								>
									<div className="i-heroicons-chevron-left w-5 h-5" />
								</button>
								<button
									type="button"
									onClick={goToToday}
									className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-all duration-200"
									disabled={isAnimating}
								>
									{t('today')}
								</button>
								<button
									type="button"
									onClick={() => navigateCalendar('next')}
									className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-all duration-200"
									disabled={isAnimating}
								>
									<div className="i-heroicons-chevron-right w-5 h-5" />
								</button>
							</div>
						</div>

						{/* Vista móvil - botón crear */}
						<button
							type="button"
							onClick={() => {
								setSelectedDate(dayjs())
								setSelectedEvent(null)
								setShowEventModal(true)
							}}
							className="lg:hidden flex items-center justify-center w-10 h-10 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
						>
							<div className="i-heroicons-plus w-5 h-5" />
						</button>
					</div>

					{/* Controles de vista y acciones */}
					<div className="flex items-center justify-between lg:justify-end space-x-3">
						{/* Selector de vista */}
						<div className="flex items-center bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-600/50 p-1">
							{(['month', 'week', 'day'] as const).map((mode) => (
								<button
									key={mode}
									type="button"
									onClick={() => setViewMode(mode)}
									className={`
										px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
										${viewMode === mode
											? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md'
											: 'text-gray-600 dark:text-gray-300 hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30'
										}
									`}
								>
									{t(`view.${mode}`)}
								</button>
							))}
						</div>

						{/* Botón crear evento - desktop */}
						<button
							type="button"
							onClick={() => {
								setSelectedDate(dayjs())
								setSelectedEvent(null)
								setShowEventModal(true)
							}}
							className="hidden lg:flex items-center space-x-2 px-4 py-2.5 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
						>
							<div className="i-heroicons-plus w-4 h-4" />
							<span className="font-medium">{t('createEvent')}</span>
						</button>
					</div>
				</div>

				{/* Filtros */}
				<div className="mt-4">
					<CalendarFilters
						selectedCategories={selectedCategories}
						onCategoriesChange={setSelectedCategories}
					/>
				</div>
			</div>

			{/* Días de la semana - solo mostrar en vista de mes y semana */}
			{viewMode !== 'day' && (
				<div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-700">
					{dayjs.weekdaysShort().map((day) => (
						<div
							key={day}
							className="py-3 px-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0"
						>
							<span className="hidden md:inline">{day}</span>
							<span className="md:hidden">{day.substring(0, 1)}</span>
						</div>
					))}
				</div>
			)}

			{/* Grid del calendario */}
			<div
				ref={calendarRef}
				className={`
					${viewMode === 'day' ? 'grid grid-cols-1' : 'grid grid-cols-7'} 
					transition-all duration-300 ease-in-out
					${isAnimating ? 'opacity-70 transform scale-98' : 'opacity-100 transform scale-100'}
				`}
			>
				{viewDays.map((day) => {
					const dayEvents = getEventsForDay(day)
					const isCurrentPeriod = viewMode === 'month' ? day.month() === currentDate.month() : true // En vista semana y día, todos los días son válidos
					const isToday = day.isSame(dayjs(), 'day')

					return (
						<div
							key={day.format('YYYY-MM-DD')}
							role="button"
							tabIndex={isCurrentPeriod ? 0 : -1}
							className={getDayStyles(day)}
							onClick={() => isCurrentPeriod && handleDayClick(day)}
							onMouseEnter={() => isCurrentPeriod && setHoveredDay(day)}
							onMouseLeave={() => setHoveredDay(null)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault()
									isCurrentPeriod && handleDayClick(day)
								}
							}}
						>
							{/* Indicador de esquina para día actual */}
							{isToday && (
								<div className="absolute top-0 right-0">
									<div className="w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-blue-500" />
									<div className="absolute -top-3 -right-3 w-2 h-2 bg-linear-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-md" />
								</div>
							)}

							{/* Número del día mejorado */}
							<div className="flex items-start justify-between mb-1">
								<div className="flex flex-col">
									<span
										className={`
											inline-flex items-center justify-center text-sm font-semibold min-w-[1.5rem] h-6
											${isToday
												? 'bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-md'
												: isCurrentPeriod
													? 'text-gray-900 dark:text-white hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 rounded-full transition-all duration-200'
													: 'text-gray-400 dark:text-gray-500'
											}
										`}
									>
										{day.date()}
									</span>
									{viewMode === 'day' && (
										<span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
											{day.format('dddd')}
										</span>
									)}
								</div>
								{dayEvents.length > 0 && (
									<div className="flex items-center space-x-1">
										<span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-linear-to-r from-blue-100 to-purple-100 dark:from-blue-900/60 dark:to-purple-900/60 text-blue-800 dark:text-blue-200 rounded-full shadow-sm border border-blue-200 dark:border-blue-700">
											{dayEvents.length}
										</span>
									</div>
								)}
							</div>

							{/* Eventos del día mejorados */}
							<div className="space-y-0.5">
								{dayEvents
									.slice(0, viewMode === 'month' ? 2 : viewMode === 'week' ? 4 : 8)
									.map((event: CalendarEvent) => (
										<CalendarEventComponent
											key={event.uuid}
											event={event}
											onClick={(e) => handleEventClick(event, e)}
											compact={viewMode === 'month'}
										/>
									))}
								{dayEvents.length > (viewMode === 'month' ? 2 : viewMode === 'week' ? 4 : 8) && (
									<div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1 bg-linear-to-r from-gray-100 to-blue-50 dark:from-gray-700 dark:to-purple-900/30 rounded-md border border-gray-200 dark:border-gray-600">
										+{dayEvents.length - (viewMode === 'month' ? 2 : viewMode === 'week' ? 4 : 8)}{' '}
										más
									</div>
								)}
							</div>

							{/* Overlay de hover */}
							<div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
						</div>
					)
				})}
			</div>

			{/* Loading overlay mejorado */}
			{loading && (
				<div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center z-10">
					<div className="flex flex-col items-center space-y-3">
						<div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent" />
						<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('loading')}</p>
					</div>
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
