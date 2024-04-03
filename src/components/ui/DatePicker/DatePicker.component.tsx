import type { FC, ReactElement } from 'react'
import dayjs from 'dayjs'
import es from 'dayjs/locale/es'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { useModal } from '@/hooks/useModal'
import { useGlobalListener } from '@/hooks/useGlobalListener'

import { Calendar } from './Calendar'
import { useCalendar } from './useCalendar'
import type { DatePickerProps } from './DatePicker.types'
import * as S from './DatePicker.styles'

dayjs.locale(es)
dayjs.extend(customParseFormat)

export const DatePicker: FC<DatePickerProps> = ({
	date,
	minDate,
	maxDate,
	label,
	onDateChange,
}): ReactElement => {
	const { isOpen, close, toggle } = useModal<HTMLButtonElement>()
	const { calendarValues, days, nextDays, prevDays, changeMonth } = useCalendar({
		date,
		onDateChange,
	})

	const inputValue = date?.format('DD [de] MMMM [de] YYYY') || ''
	const renderedPrevDays = prevDays.slice(
		prevDays.length - calendarValues.firstMonthDay.isoWeekday() + 1
	)
	const renderedNextDays = nextDays.slice(0, 7 - calendarValues.lastMonthDay.isoWeekday())

	useGlobalListener('click', close)

	return (
		<S.DatePickerContainer>
			<S.DatePicker type="text" value={inputValue} readOnly />
			<S.CalendarButton type="button" onClick={toggle}>
				<S.CalendarIcon className="i-mdi-calendar-month" />
			</S.CalendarButton>
			{isOpen && (
				<Calendar
					date={date}
					values={calendarValues}
					weekDays={weekDays}
					month={months[calendarValues.month]}
					year={calendarValues.year}
					days={days}
					prevDays={renderedPrevDays}
					nextDays={renderedNextDays}
					minDate={minDate}
					maxDate={maxDate}
					changeMonth={changeMonth}
				/>
			)}
			{label && <S.Label htmlFor="textfield-input">{label}</S.Label>}
		</S.DatePickerContainer>
	)
}

const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

const months = [
	'Enero',
	'Febrero',
	'Marzo',
	'Abril',
	'Mayo',
	'Junio',
	'Julio',
	'Agosto',
	'Septiembre',
	'Octubre',
	'Noviembre',
	'Diciembre',
]
