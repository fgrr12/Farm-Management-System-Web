import dayjs from 'dayjs'
import type { ChangeEvent } from 'react'

import type { DatePickerProps } from './DatePicker.types'

import * as S from './DatePicker.styles'

export const DatePicker: FC<DatePickerProps> = ({ date, label, onDateChange }) => {
	const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target
		onDateChange(dayjs(value))
	}
	return (
		<S.DatePickerContainer>
			<S.DatePicker
				id="datepicker-input"
				type="date"
				value={date?.format('YYYY-MM-DD')}
				onChange={handleDateChange}
			/>
			<S.Label htmlFor="datepicker-input">{label}</S.Label>
		</S.DatePickerContainer>
	)
}
