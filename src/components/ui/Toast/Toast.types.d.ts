import type { ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'
export type ToastPosition =
	| 'top-right'
	| 'top-left'
	| 'bottom-right'
	| 'bottom-left'
	| 'top-center'
	| 'bottom-center'

export interface ToastProps {
	id: string
	message: ReactNode
	type?: ToastType
	duration?: number
	position?: ToastPosition
	dismissible?: boolean
	action?: {
		label: string
		onClick: () => void
	}
	onClose: (id: string) => void
}

export interface ToastConfig {
	icon: string
	bgColor: string
	borderColor: string
	textColor: string
	iconColor: string
}
