import type dayjs from 'dayjs'

export interface DatePickerProps {
	legend: string
	label: string
	date: dayjs.Dayjs | null
	onDateChange: (date: dayjs.Dayjs | null) => void
	error?: string
}
