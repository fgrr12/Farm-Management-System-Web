import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
	uuid: string
	animalId: string
	breed: Breed
	gender: Gender
}
