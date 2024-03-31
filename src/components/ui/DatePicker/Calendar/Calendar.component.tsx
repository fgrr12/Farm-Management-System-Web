import { FC, ReactElement, MouseEvent } from 'react'
import dayjs from 'dayjs'

import type { CalendarItem, CalendarValues } from '../useCalendar'
import * as S from './Calendar.styles'

interface CalendarProps {
	date: dayjs.Dayjs | null
	values: CalendarValues
	weekDays: string[]
	month: string
	year: string | number
	days: CalendarItem[]
	prevDays: CalendarItem[]
	nextDays: CalendarItem[]
	minDate?: dayjs.Dayjs
	maxDate?: dayjs.Dayjs
	changeMonth: (direction: 'prev' | 'next') => () => void
}

export const Calendar: FC<CalendarProps> = ({
	date,
	values,
	weekDays,
	month,
	year,
	days,
	prevDays,
	nextDays,
	minDate,
	maxDate,
	changeMonth,
}): ReactElement => {
	const stopCalendarPropagation = (event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation()
	}

	const isCurrentDate = (item: CalendarItem) => {
		return (
			date?.date() === item.day && date?.month() === values.month && date?.year() === values.year
		)
	}

	const isDisabled = (date: dayjs.Dayjs) => {
		if (!minDate && !maxDate) return false
		if (minDate && maxDate) return date.isBefore(minDate, 'day') || date.isAfter(maxDate, 'day')
		if (minDate) return date.isBefore(minDate, 'day')
		if (maxDate) return date.isAfter(maxDate, 'day')
	}

	return (
		<S.CalendarContainer onClick={stopCalendarPropagation}>
			<S.CalendarPolygon />
			<S.Calendar>
				<S.CalendarHeader>
					<S.MonthButtonsContainer>
						<S.MonthButton type="button" onClick={changeMonth('prev')}>
							<div className="i-ic-outline-arrow-back-ios-new" />
						</S.MonthButton>
						<S.CalendarMonth>{month}</S.CalendarMonth>
						<S.MonthButton type="button" onClick={changeMonth('next')}>
							<div className="i-ic-outline-arrow-forward-ios" />
						</S.MonthButton>
					</S.MonthButtonsContainer>
					<span>{year}</span>
				</S.CalendarHeader>
				<div>
					<S.WeekDays>
						{weekDays.map((day) => (
							<span key={day}>{day}</span>
						))}
					</S.WeekDays>
					<S.CalendarContent>
						{prevDays.map((item) => (
							<S.DayButton
								type="button"
								key={item.key}
								onClick={item.handleClick}
								$isAnotherMonth
								disabled={isDisabled(item.date)}
							>
								<div>{item.day}</div>
							</S.DayButton>
						))}
						{days.map((item) => (
							<S.DayButton
								type="button"
								key={item.key}
								onClick={item.handleClick}
								$isCurrentDate={isCurrentDate(item)}
								disabled={isDisabled(item.date)}
							>
								<div>{item.day}</div>
							</S.DayButton>
						))}
						{nextDays.map((item) => (
							<S.DayButton
								type="button"
								key={item.key}
								onClick={item.handleClick}
								$isAnotherMonth
								disabled={isDisabled(item.date)}
							>
								<div>{item.day}</div>
							</S.DayButton>
						))}
					</S.CalendarContent>
				</div>
			</S.Calendar>
		</S.CalendarContainer>
	)
}
