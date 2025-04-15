import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
	animalId: string
	breed: Breed
	gender: Gender
}
