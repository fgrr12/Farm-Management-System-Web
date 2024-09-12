import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
	animalId: string
	species: {
		uuid: string
		name: string
	}
	breed: Breed
	birthDate?: string
	gender: Gender
	color: string
}
