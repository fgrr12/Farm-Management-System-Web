import {
	autoPlacement,
	autoUpdate,
	FloatingFocusManager,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
} from '@floating-ui/react'
import dayjs from 'dayjs'
import { type ChangeEvent, type FC, useState } from 'react'
import { DayPicker, type DropdownProps } from 'react-day-picker'
import { enUS, es } from 'react-day-picker/locale'

import { useUserStore } from '@/store/useUserStore'
import 'react-day-picker/style.css'

import { ActionButton } from '@/components/ui/ActionButton'

import type { DatePickerProps } from './DatePicker.types'

function CustomSelectDropdown(props: DropdownProps) {
	const { options, value, onChange } = props

	const handleValueChange = (event: ChangeEvent<HTMLSelectElement>) => {
		event.preventDefault()
		onChange && onChange(event)
	}

	return (
		<select
			className="select select-bordered w-25 h-12 pl-2"
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

export const DatePicker: FC<DatePickerProps> = ({ legend, label, date, onDateChange }) => {
	const { user } = useUserStore()
	const [open, setOpen] = useState(false)

	const handleDateChange = (selected: Date) => {
		onDateChange(dayjs(selected))
		setOpen(false)
	}

	const { refs, floatingStyles, context } = useFloating({
		open,
		onOpenChange: setOpen,
		middleware: [
			offset(({ placement }) => {
				if (placement.includes('top')) return { mainAxis: 30 }
				return -30
			}),
			autoPlacement({
				allowedPlacements: ['top', 'bottom'],
			}),
			shift(),
		],
		whileElementsMounted: autoUpdate,
	})

	const click = useClick(context)
	const dismiss = useDismiss(context)

	const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss])

	return (
		<fieldset className="fieldset w-full relative">
			<legend className="fieldset-legend">{legend}</legend>

			<div className="flex items-center gap-2">
				<button
					type="button"
					className="input input-border w-full h-12 pl-2 pr-2 flex items-center justify-between"
					ref={refs.setReference}
					onClick={() => setOpen((prev) => !prev)}
					{...getReferenceProps()}
				>
					{date?.isValid() ? dayjs(date).format('DD/MM/YYYY') : label}
					<i className="i-material-symbols-calendar-month w-6! h-6!" />
				</button>

				{date?.isValid() && (
					<ActionButton
						title="Clear"
						icon="i-material-symbols-cancel-outline"
						onClick={() => onDateChange(null)}
					/>
				)}
			</div>

			{open && (
				<FloatingFocusManager context={context} modal={false}>
					<div
						className="z-50"
						ref={refs.setFloating}
						style={floatingStyles}
						{...getFloatingProps()}
					>
						<DayPicker
							className="react-day-picker p-2"
							mode="single"
							captionLayout="dropdown"
							locale={user?.language === 'spa' ? es : enUS}
							components={{ Dropdown: CustomSelectDropdown }}
							selected={date?.toDate()}
							onSelect={handleDateChange}
							footer={label}
							required
						/>
					</div>
				</FloatingFocusManager>
			)}
		</fieldset>
	)
}
