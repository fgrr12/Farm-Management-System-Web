import type { ButtonHTMLAttributes } from 'react'

// Component types
export type ActionButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
	icon?: string
}
