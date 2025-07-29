import type { InputHTMLAttributes } from 'react'

export type TextFieldVariant = 'default' | 'filled' | 'outlined'
export type TextFieldSize = 'sm' | 'md' | 'lg'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
	label?: string
	error?: string
	helperText?: string
	variant?: TextFieldVariant
	size?: TextFieldSize
	leftIcon?: string
	rightIcon?: string
	loading?: boolean
	success?: boolean
	successMessage?: string
}

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type'> {
	showStrengthIndicator?: boolean
	strengthText?: {
		weak: string
		medium: string
		strong: string
	}
}
