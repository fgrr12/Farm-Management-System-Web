import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
	animalId: number
	breed: string
	gender: string
	picture?: string
}
