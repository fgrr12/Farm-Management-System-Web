import type { SelectHTMLAttributes } from 'react'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
	items: any[]
	optionValue?: string
	optionLabel?: string
	defaultLabel?: string
}

export interface DefaultOptionProps {
	name: string
}
