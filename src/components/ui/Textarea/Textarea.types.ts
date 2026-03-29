import type { TextareaHTMLAttributes } from 'react'

export type TextareaVariant = 'default' | 'filled' | 'outlined'
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string
	error?: string
	helperText?: string
	variant?: TextareaVariant
	resize?: TextareaResize
	autoResize?: boolean
	maxLength?: number
	showCharCount?: boolean
	success?: boolean
	successMessage?: string
	loading?: boolean
}
