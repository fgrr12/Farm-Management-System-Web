import type dayjs from 'dayjs'
import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
	animalId: number
	species: string
	breed: string
	birthDate: dayjs.Dayjs
	gender: string
	color: string
}
