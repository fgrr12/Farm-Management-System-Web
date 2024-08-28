import type dayjs from 'dayjs'
import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
	animalId: string
	species: string
	breed: string
	birthDate?: dayjs.Dayjs
	gender: Gender
	color: string
}
