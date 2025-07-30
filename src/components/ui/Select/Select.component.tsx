import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type MouseEvent, memo, useCallback, useId, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '../ActionButton'
import type { SelectProps } from './Select.types'

export const Select: FC<SelectProps> = memo(
	({
		items,
		legend,
		label,
		value,
		error,
		helperText,
		variant = 'default',
		size = 'md',
		required,
		optionValue = 'value',
		optionLabel = 'label',
		defaultLabel = null,
		loading = false,
		searchable = false,
		clearable = true,
		leftIcon,
		success = false,
		successMessage,
		className,
		...rest
	}) => {
		const { t } = useTranslation(['common'])
		const selectRef = useRef<HTMLSelectElement>(null)
		const fieldId = useId()
		const [isFocused, setIsFocused] = useState(false)

		const displayLabel = label || legend

		const selectClasses = useMemo(() => {
			const baseClasses = 'w-full transition-all duration-200 focus:outline-none cursor-pointer'

			const variantClasses = {
				default:
					'input bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
				filled:
					'bg-gray-100 border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:bg-white rounded-t-lg rounded-b-none px-4',
				outlined:
					'bg-transparent border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
			}

			const sizeClasses = {
				sm: 'h-10 text-sm px-3',
				md: 'h-12 text-base px-4',
				lg: 'h-14 text-lg px-5',
			}

			const stateClasses = error
				? 'border-red-500 focus:border-red-500 focus:ring-red-200'
				: success
					? 'border-green-500 focus:border-green-500 focus:ring-green-200'
					: ''

			const iconPadding = leftIcon ? 'pl-12' : ''
			const rightPadding = error ? 'pr-20' : 'pr-12' // More space when error icon is present

			return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses} ${iconPadding} ${rightPadding} ${className || ''}`
		}, [variant, size, error, success, leftIcon, className])

		const labelClasses = useMemo(() => {
			const baseClasses = 'block text-sm font-medium mb-2 transition-colors duration-200'
			const stateClasses = error
				? 'text-red-700'
				: success
					? 'text-green-700'
					: isFocused
						? 'text-blue-700'
						: 'text-gray-700'

			return `${baseClasses} ${stateClasses}`
		}, [error, success, isFocused])

		const normalizedValue = value === undefined || value === null ? '' : value
		const hasValue =
			normalizedValue !== '' && normalizedValue !== undefined && normalizedValue !== null

		useGSAP(() => {
			if (selectRef.current) {
				gsap.fromTo(
					selectRef.current,
					{ y: 10, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
				)
			}
		}, [])

		const handleFocus = useCallback(
			(e: React.FocusEvent<HTMLSelectElement>) => {
				setIsFocused(true)
				if (selectRef.current) {
					gsap.to(selectRef.current, { scale: 1.01, duration: 0.2, ease: 'power1.out' })
				}
				rest.onFocus?.(e)
			},
			[rest.onFocus]
		)

		const handleBlur = useCallback(
			(e: React.FocusEvent<HTMLSelectElement>) => {
				setIsFocused(false)
				if (selectRef.current) {
					gsap.to(selectRef.current, { scale: 1, duration: 0.2, ease: 'power1.out' })
				}
				rest.onBlur?.(e)
			},
			[rest.onBlur]
		)

		const handleClear = useCallback(
			(event: MouseEvent<HTMLButtonElement>) => {
				event.stopPropagation()

				if (rest.onChange) {
					const syntheticEvent = {
						target: { value: '', name: rest.name },
						currentTarget: { value: '', name: rest.name },
					} as React.ChangeEvent<HTMLSelectElement>

					rest.onChange(syntheticEvent)
				}

				if (selectRef.current) {
					selectRef.current.value = ''
				}
			},
			[rest.onChange, rest.name]
		)

		const renderOptions = () => {
			// Group options if they have a group property
			const groupedOptions = items.reduce((acc: any, item: any) => {
				const group = item.group || 'default'
				if (!acc[group]) acc[group] = []
				acc[group].push(item)
				return acc
			}, {})

			const hasGroups = Object.keys(groupedOptions).length > 1 || !groupedOptions.default

			if (hasGroups && !groupedOptions.default) {
				return Object.entries(groupedOptions).map(([groupName, groupItems]: [string, any]) => (
					<optgroup key={groupName} label={groupName}>
						{(groupItems as any[]).map((item) => (
							<option key={item[optionValue]} value={item[optionValue]} disabled={item.disabled}>
								{item[optionLabel] || item.name}
							</option>
						))}
					</optgroup>
				))
			}

			return items.map((item) => (
				<option key={item[optionValue]} value={item[optionValue]} disabled={item.disabled}>
					{item[optionLabel] || item.name}
				</option>
			))
		}

		return (
			<div className="w-full">
				{displayLabel && (
					<label htmlFor={fieldId} className={labelClasses}>
						{displayLabel}
						{required && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}

				<div className="relative group">
					{/* Left Icon */}
					{leftIcon && (
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<i
								className={`${leftIcon} w-5! h-5! ${error ? 'bg-red-500!' : success ? 'bg-green-500!' : 'bg-gray-400!'}`}
							/>
						</div>
					)}

					{/* Select Field */}
					<select
						ref={selectRef}
						id={fieldId}
						className={selectClasses}
						value={normalizedValue}
						required={required}
						disabled={loading}
						aria-invalid={!!error}
						aria-describedby={
							error
								? `${fieldId}-error`
								: helperText
									? `${fieldId}-helper`
									: success
										? `${fieldId}-success`
										: undefined
						}
						onFocus={handleFocus}
						onBlur={handleBlur}
						{...rest}
					>
						<option value="" disabled>
							{defaultLabel ?? t('select.default')}
						</option>
						{renderOptions()}
					</select>

					{/* Right Icons */}
					<div className="absolute inset-y-0 right-0 flex items-center">
						{error && (
							<div className="flex items-center px-2">
								<i className="i-material-symbols-error w-4! h-4! bg-red-500!" title={error} />
							</div>
						)}

						{loading ? (
							<div className="flex items-center px-2">
								<div className="animate-spin">
									<i className="i-material-symbols-progress-activity w-5! h-5! bg-blue-500!" />
								</div>
							</div>
						) : success ? (
							<div className="flex items-center px-2">
								<i className="i-material-symbols-check-circle w-5! h-5! bg-green-500!" />
							</div>
						) : hasValue && clearable ? (
							<div className="flex items-center px-2 z-1">
								<ActionButton
									title="Clear"
									icon="i-lucide-circle-x"
									onClick={handleClear}
									disabled={rest.disabled}
								/>
							</div>
						) : (
							<div className="flex items-center px-1 pointer-events-none text-gray-500">
								<i className="i-material-symbols-keyboard-arrow-down w-8! h-8! bg-gray-400!" />
							</div>
						)}
					</div>

					{/* Error Tooltip */}
					{error && (
						<div
							id={`${fieldId}-error`}
							className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-20 max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 ease-in-out"
							role="tooltip"
							aria-live="polite"
						>
							<div className="text-sm text-red-700 font-medium">{error}</div>
							<div className="absolute -top-2 left-4 w-4 h-4 bg-red-50 border-l border-t border-red-200 transform rotate-45" />
						</div>
					)}
				</div>

				{/* Helper Text */}
				{helperText && !error && (
					<div id={`${fieldId}-helper`} className="text-sm text-gray-600 mt-1">
						{helperText}
					</div>
				)}

				{/* Success Message */}
				{success && successMessage && (
					<div
						id={`${fieldId}-success`}
						className="text-sm text-green-600 mt-1 flex items-center gap-1"
					>
						<i className="i-material-symbols-check-circle w-4! h-4! bg-green-500!" />
						<span>{successMessage}</span>
					</div>
				)}
			</div>
		)
	}
)
