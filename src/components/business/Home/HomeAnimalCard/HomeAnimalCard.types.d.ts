import type dayjs from 'dayjs'
import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
	animalId: number
	animalKind: string
	animalBreed: string
	animalBirthDate: dayjs.Dayjs
	animalGender: string
	animalColor: string
}
