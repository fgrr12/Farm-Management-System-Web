import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

// Component types
export type ActionButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
	icon?: string
}
