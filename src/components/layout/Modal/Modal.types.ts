import type { DialogHTMLAttributes, ReactNode } from 'react'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'
export type ModalVariant = 'default' | 'danger' | 'success' | 'warning'

export interface ModalProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'title'> {
	title?: ReactNode
	message?: ReactNode
	children?: ReactNode
	open: boolean
	size?: ModalSize
	variant?: ModalVariant
	showCloseButton?: boolean
	closeOnBackdrop?: boolean
	onAccept?: () => void
	onCancel?: () => void
	acceptText?: string
	cancelText?: string
	acceptVariant?: 'primary' | 'secondary' | 'danger'
	loading?: boolean
	loadingText?: string
}

export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
	title: ReactNode
	message: ReactNode
	onAccept: () => void
}
