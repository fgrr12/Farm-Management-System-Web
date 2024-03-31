import type dayjs from 'dayjs'

export interface DatePickerProps {
	date: dayjs.Dayjs
	minDate?: dayjs.Dayjs
	maxDate?: dayjs.Dayjs
	label?: string
	onDateChange?: (date: dayjs.Dayjs) => void
}
