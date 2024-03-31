import type { InputHTMLAttributes } from 'react'

// Common types
export type TextFieldType = 'text' | 'search' | 'url' | 'email' | 'number' | 'tel'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	type?: TextFieldType
	label?: string
}
