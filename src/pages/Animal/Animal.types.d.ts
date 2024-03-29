import type dayjs from 'dayjs'

export interface Animal {
	animalId: number
	animalKind: string
	animalBreed: string
	animalBirthDate: dayjs.Dayjs
	animalGender: string
	animalColor: string
	weight: number
}
