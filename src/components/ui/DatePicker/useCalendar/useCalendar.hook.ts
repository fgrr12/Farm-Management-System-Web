import { useState } from 'react'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isoWeek from 'dayjs/plugin/isoWeek'
import type { UseCalendarProps, CalendarItem, CalendarValues } from './useCalendar.types'

dayjs.extend(customParseFormat)
dayjs.extend(isoWeek)

export const useCalendar = ({ date, onDateChange }: UseCalendarProps) => {
	const [calendarDate, setCalendarDate] = useState(date)
	const calendarValues = getDateValues(calendarDate)

	const prevMonth = calendarValues.firstMonthDay.subtract(1, 'month')
	const nextMonth = calendarValues.lastMonthDay.add(1, 'month')

	const prevMonthValues = getDateValues(prevMonth)
	const nextMonthValues = getDateValues(nextMonth)

	const changeMonth = (direction: 'prev' | 'next') => () => {
		const newDate = direction === 'prev' ? prevMonth : nextMonth
		setCalendarDate(newDate)
	}

	const days: CalendarItem[] = Array.from(
		{ length: calendarValues.lastMonthDay.date() },
		(_, index) => {
			const day = index + 1
			const month = calendarValues.month + 1
			const year = calendarValues.year
			const key = `${day}/${month}/${year}`
			const date = dayjs(key, 'D/M/YYYY')
			const handleClick = () => {
				onDateChange?.(date)
			}
			return { date, day, key, handleClick }
		}
	)

	const prevDays: CalendarItem[] = Array.from(
		{ length: prevMonthValues.lastMonthDay.date() },
		(_, index) => {
			const day = index + 1
			const month = prevMonthValues.month + 1
			const year = prevMonthValues.year
			const key = `${day}/${month}/${year}`
			const date = dayjs(key, 'D/M/YYYY')
			const handleClick = () => {
				onDateChange?.(date)
				setCalendarDate(prevMonth)
			}
			return { date, day, key, handleClick }
		}
	)

	const nextDays: CalendarItem[] = Array.from(
		{ length: nextMonthValues.lastMonthDay.date() },
		(_, index) => {
			const day = index + 1
			const month = nextMonthValues.month + 1
			const year = nextMonthValues.year
			const key = `${day}/${month}/${year}`
			const date = dayjs(key, 'D/M/YYYY')
			const handleClick = () => {
				onDateChange?.(date)
				setCalendarDate(nextMonth)
			}
			return { date, day, key, handleClick }
		}
	)

	return {
		days,
		prevDays,
		nextDays,
		calendarValues,
		changeMonth,
	}
}

const getDateValues = (date: dayjs.Dayjs): CalendarValues => {
	return {
		month: date.month(),
		year: date.year(),
		firstMonthDay: date.startOf('month'),
		lastMonthDay: date.endOf('month'),
	}
}
