import type dayjs from 'dayjs'

export interface DatePickerProps {
	date: dayjs.Dayjs | null
	label: string
	onDateChange: (date: dayjs.Dayjs) => void
}
