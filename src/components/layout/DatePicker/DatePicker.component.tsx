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
import { type ChangeEvent, type FC, type MouseEvent, useId, useState } from 'react'
import { DayPicker, type DropdownProps } from 'react-day-picker'
import { enUS, es } from 'react-day-picker/locale'

import { useUserStore } from '@/store/useUserStore'

import type { DatePickerProps } from './DatePicker.types'
import 'react-day-picker/style.css'

import { ActionButton } from '@/components/ui/ActionButton'

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

export const DatePicker: FC<DatePickerProps> = ({ legend, label, date, onDateChange, error }) => {
	const baseId = useId()
	const { user } = useUserStore()
	const [open, setOpen] = useState(false)

	const handleDateChange = (selected: Date) => {
		onDateChange(dayjs(selected))
		setOpen(false)
	}

	const handleClear = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation()
		onDateChange(null)
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
		<fieldset className="fieldset w-full relative group">
			<legend className="fieldset-legend">{legend}</legend>

			<div className="flex items-center gap-2 relative">
				<div
					role="button"
					tabIndex={0}
					className={`input input-border w-full h-12 pl-2 pr-2 flex items-center justify-between bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-400 ${error ? 'border-red-500 dark:border-red-400' : ''}`}
					ref={refs.setReference}
					onClick={() => setOpen((prev) => !prev)}
					aria-label={
						date?.isValid() ? `Selected date: ${dayjs(date).format('DD/MM/YYYY')}` : 'Select date'
					}
					aria-invalid={!!error}
					aria-expanded={open}
					aria-describedby={error ? `${baseId}-datepicker-error` : undefined}
					{...getReferenceProps()}
				>
					<span className="text-gray-900 dark:text-gray-100">
						{date?.isValid() ? dayjs(date).format('DD/MM/YYYY') : label}
					</span>
					<div className="flex items-center gap-1">
						{error && (
							<i
								className="i-lucide-alert-circle text-red-500 dark:text-red-400 w-4 h-4 cursor-help"
								title={error}
							/>
						)}
						{!date?.isValid() ? (
							<ActionButton
								title="Select"
								icon="i-material-symbols-calendar-month"
								onClick={() => setOpen((prev) => !prev)}
							/>
						) : (
							<ActionButton
								title="Clear"
								icon="i-material-symbols-event-busy-rounded"
								onClick={handleClear}
							/>
						)}
					</div>
				</div>

				{error && (
					<div
						id={`${baseId}-datepicker-error`}
						className="absolute top-full left-0 mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg dark:shadow-gray-900/20 z-30 max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 ease-in-out"
						role="tooltip"
						aria-live="polite"
					>
						<div className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</div>
						<div className="absolute -top-2 left-4 w-4 h-4 bg-red-50 dark:bg-red-900/20 border-l border-t border-red-200 dark:border-red-800 transform rotate-45" />
					</div>
				)}
			</div>

			{open && (
				<FloatingFocusManager context={context} modal={false}>
					<div
						className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-gray-900/20"
						ref={refs.setFloating}
						style={floatingStyles}
						{...getFloatingProps()}
					>
						<DayPicker
							className="react-day-picker p-2 text-gray-900 dark:text-gray-100"
							mode="single"
							captionLayout="dropdown"
							fromYear={2010}
							toYear={dayjs().year() + 10}
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
