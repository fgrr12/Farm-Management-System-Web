import { type MouseEvent, type ReactElement, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionButton } from '../ActionButton'
import type { SelectProps } from './Select.types'

export const Select: FC<SelectProps> = ({
	items,
	legend,
	value,
	error,
	required,
	optionValue = 'value',
	optionLabel = 'name',
	defaultLabel = null,
	...rest
}): ReactElement => {
	const { t } = useTranslation(['common'])
	const ref = useRef<HTMLSelectElement>(null)
	const fieldId = useId()

	const normalizedValue = value === undefined || value === null ? '' : value
	const hasValue =
		normalizedValue !== '' && normalizedValue !== undefined && normalizedValue !== null

	const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation()

		if (rest.onChange) {
			const syntheticEvent = {
				target: { value: '', name: rest.name },
				currentTarget: { value: '', name: rest.name },
			} as React.ChangeEvent<HTMLSelectElement>

			rest.onChange(syntheticEvent)
		}

		if (ref.current) {
			ref.current.value = ''
		}
	}

	return (
		<fieldset className="fieldset w-full">
			<legend className="fieldset-legend">
				{legend}
				{required && <span className="text-red-500 ml-1">*</span>}
			</legend>
			<div className="relative w-full mx-auto group">
				<select
					id={fieldId}
					className={`input w-full h-12 validator cursor-pointer ${
						error ? 'border-red-500 pr-20' : ''
					}`}
					value={normalizedValue}
					ref={ref}
					required={required}
					aria-invalid={!!error}
					aria-describedby={error ? `${fieldId}-error` : undefined}
					{...rest}
				>
					<option value="" disabled>
						{defaultLabel ?? t('select.default')}
					</option>
					{items.map((item) => (
						<option key={item[optionValue]} value={item[optionValue]}>
							{item[optionLabel]}
						</option>
					))}
				</select>

				<div className="absolute inset-y-0 right-0 flex items-center">
					{error && (
						<div className="flex items-center px-2">
							<i className="i-lucide-alert-circle text-red-500 w-4 h-4" title={error} />
						</div>
					)}

					{hasValue ? (
						<div className="flex items-center px-2 z-10">
							<ActionButton
								title="Clear"
								icon="i-lucide-circle-x"
								onClick={handleClear}
								disabled={rest.disabled}
							/>
						</div>
					) : (
						<div className="flex items-center px-1 pointer-events-none text-gray-500">
							<i className="i-ic-outline-arrow-drop-down w-8! h-8!" />
						</div>
					)}
				</div>

				{error && (
					<div
						id={`${fieldId}-error`}
						className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-30 max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 ease-in-out"
						role="tooltip"
						aria-live="polite"
					>
						<div className="text-sm text-red-700 font-medium">{error}</div>

						<div className="absolute -top-2 left-4 w-4 h-4 bg-red-50 border-l border-t border-red-200 transform rotate-45" />
					</div>
				)}
			</div>
		</fieldset>
	)
}
