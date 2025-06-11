import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
	uuid: string
	animalId: string
	breedName: string
	gender: Gender
}
