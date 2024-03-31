import type { DialogHTMLAttributes } from 'react'

export interface ModalProps extends DialogHTMLAttributes<HTMLDialogElement> {
	title: string
	message: string
	open: boolean
	onAccept?: () => void
	onCancel?: () => void
}
