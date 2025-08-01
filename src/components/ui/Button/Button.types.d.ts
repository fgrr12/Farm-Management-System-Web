import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
	loading?: boolean
	loadingText?: string
	leftIcon?: string
	rightIcon?: string
	fullWidth?: boolean
}

export interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	// BackButton specific props can be added here
}
