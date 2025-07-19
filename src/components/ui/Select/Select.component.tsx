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

	const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation()
		if (!ref.current) return
		ref.current.value = ''
		ref.current.dispatchEvent(new Event('change', { bubbles: true }))
	}

	return (
		<fieldset className="fieldset w-full">
			<legend className="fieldset-legend">
				{legend}
				{required && <span className="text-red-500 ml-1">*</span>}
			</legend>
			<div className="relative w-full mx-auto">
				<select
					id={fieldId}
					className={`input w-full h-12 validator cursor-pointer ${error ? 'input-error' : ''}`}
					value={value}
					ref={ref}
					required={required}
					aria-invalid={!!error}
					{...rest}
				>
					<option value="" hidden disabled>
						{defaultLabel ?? t('select.default')}
					</option>
					{items.map((item) => (
						<option key={item[optionValue]} value={item[optionValue]}>
							{item[optionLabel]}
						</option>
					))}
				</select>

				{!value ? (
					<div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none text-gray-500 hover:text-gray-700">
						<i className="i-ic-outline-arrow-drop-down w-8! h-8!" />
					</div>
				) : (
					<div className="absolute inset-y-0 right-0 flex items-center px-2 z-10">
						<ActionButton
							title="Clear"
							icon="i-lucide-circle-x"
							onClick={handleClear}
							disabled={rest.disabled}
						/>
					</div>
				)}
			</div>
			{error && <div className="mt-1 text-sm text-red-600">{error}</div>}
		</fieldset>
	)
}
