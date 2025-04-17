import { useRef, type MouseEvent, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { SelectProps } from './Select.types'

export const Select: FC<SelectProps> = ({
	items,
	legend,
	value,
	optionValue = 'value',
	optionLabel = 'name',
	defaultLabel = null,
	...rest
}): ReactElement => {
	const { t } = useTranslation(['common'])
	const ref = useRef<HTMLSelectElement>(null)

	const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation()
		if (!ref.current) return
		ref.current.value = ''
		ref.current.dispatchEvent(new Event('change', { bubbles: true }))
	}

	return (
		<fieldset className="fieldset w-full">
			<legend className="fieldset-legend text-black dark:text-white">{legend}</legend>
			<div className="relative w-full mx-auto">
				<select className="input w-full h-12" value={value} ref={ref} {...rest}>
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
					<button
						className="absolute inset-y-0 right-0 flex items-center px-2 text-red-400 hover:text-red-600"
						type="button"
						onClick={handleClear}
						disabled={rest.disabled}
					>
						<i className="i-lucide-circle-x w-6! h-6!" />
					</button>
				)}
			</div>
		</fieldset>
	)
}
