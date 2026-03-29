import type { ChangeEvent, DragEvent, InputHTMLAttributes } from 'react'

export type DropEvent<T = HTMLInputElement | HTMLDivElement> = DragEvent<T> | ChangeEvent<T>

export interface DropzoneProps extends InputHTMLAttributes<HTMLInputElement> {
	cleanFile: boolean
	pictureUrl?: string
	onFile: (file: File, event: any) => void
}
