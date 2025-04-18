import type { HTMLAttributes, ReactNode } from 'react'

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
	title: string
	location: number
	children: ReactNode
}
