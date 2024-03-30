import type { HTMLAttributes } from 'react'

// Component types
export type PageHeaderProps = PropsWithChildren<HTMLAttributes<HTMLHeadingElement>> & {
	onBack?: () => void
}
