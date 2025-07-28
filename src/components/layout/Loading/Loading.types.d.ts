import type { HTMLAttributes, ReactNode } from 'react'

export type LoadingVariant = 'default' | 'minimal' | 'dots' | 'pulse' | 'spinner'
export type LoadingSize = 'sm' | 'md' | 'lg'

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
	open?: boolean
	variant?: LoadingVariant
	size?: LoadingSize
	message?: ReactNode
	showBackdrop?: boolean
	backdropBlur?: boolean
}
