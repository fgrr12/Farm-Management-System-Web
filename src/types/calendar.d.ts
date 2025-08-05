interface CalendarEvent {
	uuid: string
	title: string
	description?: string
	date: string // ISO string
	time?: string // HH:mm format
	type: 'medication' | 'vaccination' | 'task' | 'appointment' | 'general'
	priority: 'low' | 'medium' | 'high' | 'critical'
	status: 'pending' | 'completed' | 'cancelled'
	farmUuid: string
	animalId?: string
	relatedUuid?: string // ID del registro relacionado (tarea, medicación, etc.)
	location?: string
	reminder?: boolean
	reminderMinutes?: number
	notes?: string
	tags?: string[]
	createdBy: string
	createdAt: string
	updatedAt?: string
}

interface CalendarDay {
	date: string // YYYY-MM-DD
	events: CalendarEvent[]
	isToday: boolean
	isCurrentMonth: boolean
}

interface CalendarMonth {
	year: number
	month: number // 0-11
	days: CalendarDay[]
}

interface CalendarFilters {
	types: CalendarEvent['type'][]
	priorities: CalendarEvent['priority'][]
	status: CalendarEvent['status'][]
	animalUuid?: string
}
