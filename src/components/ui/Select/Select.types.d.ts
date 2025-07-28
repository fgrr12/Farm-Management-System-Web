import type { SelectHTMLAttributes } from 'react'

export type SelectVariant = 'default' | 'filled' | 'outlined'
export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
	value: string | number
	label: string
	disabled?: boolean
	group?: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	items: SelectOption[] | any[]
	legend?: string
	label?: string
	error?: string
	helperText?: string
	variant?: SelectVariant
	size?: SelectSize
	optionValue?: string
	optionLabel?: string
	defaultLabel?: string
	loading?: boolean
	searchable?: boolean
	clearable?: boolean
	leftIcon?: string
	success?: boolean
	successMessage?: string
}

export interface DefaultOptionProps {
	name: string
}
