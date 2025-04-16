import { useId, type ChangeEvent } from 'react'
import { DayPicker, type DropdownProps } from 'react-day-picker'
import { enUS, es } from 'react-day-picker/locale'

import type { DatePickerProps } from './DatePicker.types'

import { useUserStore } from '@/store/useUserStore'
import dayjs from 'dayjs'
import 'react-day-picker/style.css'

export function CustomSelectDropdown(props: DropdownProps) {
	const { options, value, onChange } = props

	const handleValueChange = (event: ChangeEvent<HTMLSelectElement>) => {
		event.preventDefault()
		onChange && onChange(event)
	}

	return (
		<select
			className="select select-bordered w-25 h-12 pl-2!"
			value={value}
			onChange={handleValueChange}
		>
			{options!.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	)
}

export const DatePicker: FC<DatePickerProps> = ({ date, label, onDateChange }) => {
	const { user } = useUserStore()
	const id = useId()

	const handleDateChange = (date: Date) => {
		onDateChange(dayjs(date))
	}

	return (
		<fieldset className="fieldset">
			<button
				type="button"
				popoverTarget={id}
				className="input input-border w-full h-12 pl-2! pr-2! flex items-center justify-between"
				style={{ anchorName: '--rdp' } as React.CSSProperties}
			>
				{date?.isValid() ? dayjs(date).format('DD/MM/YYYY') : label}
				<i className="i-material-symbols-calendar-month w-6! h-6!" />
			</button>
			<div
				popover="auto"
				id={id}
				className="dropdown"
				style={{ positionAnchor: '--rdp' } as React.CSSProperties}
			>
				<DayPicker
					className="react-day-picker p-2!"
					captionLayout="dropdown"
					locale={user?.language === 'spa' ? es : enUS}
					components={{ Dropdown: CustomSelectDropdown }}
					mode="single"
					selected={date?.toDate()}
					onSelect={handleDateChange}
					footer={label}
					required
				/>
			</div>
		</fieldset>
	)
}
