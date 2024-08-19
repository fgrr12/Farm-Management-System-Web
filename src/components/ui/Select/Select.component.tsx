import { useRef, type FC, type MouseEvent, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { SelectProps } from './Select.types'

import * as S from './Select.styles'

export const Select: FC<SelectProps> = ({
	label,
	items,
	optionValue = 'value',
	optionLabel = 'name',
	defaultLabel = null,
	value,
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
		<S.DropdownContainer>
			<S.Label>{label}</S.Label>
			<S.Dropdown ref={ref} value={value} {...rest}>
				<option value="" hidden disabled>
					{defaultLabel ?? t('select.default')}
				</option>
				{items.map((item) => (
					<option key={item[optionValue]} value={item[optionValue]}>
						{item[optionLabel]}
					</option>
				))}
			</S.Dropdown>
			{value ? (
				<S.ClearButton type="button" onClick={handleClear} disabled={rest.disabled}>
					<S.CircleX className="i-lucide-circle-x" />
				</S.ClearButton>
			) : (
				<S.Arrow className="i-ic-outline-arrow-drop-down" />
			)}
		</S.DropdownContainer>
	)
}
