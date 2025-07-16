import type { DialogHTMLAttributes, RefObject } from 'react'

export type LoadingProps = DialogHTMLAttributes<HTMLDialogElement> & {
	open?: boolean
}
export type LoadingRef = RefObject<HTMLDialogElement>
