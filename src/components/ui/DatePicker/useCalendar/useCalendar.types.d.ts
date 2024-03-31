import type dayjs from 'dayjs'

export interface UseCalendarProps {
	date: dayjs.Dayjs
	onDateChange?: (date: dayjs.Dayjs) => void
}

export interface CalendarItem {
	date: dayjs.Dayjs
	day: number
	key: string
	handleClick: () => void
}

export interface CalendarValues {
	month: number
	year: number
	firstMonthDay: dayjs.Dayjs
	lastMonthDay: dayjs.Dayjs
}
