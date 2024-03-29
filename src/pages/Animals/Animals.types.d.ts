import type dayjs from 'dayjs'

export interface AnimalCard {
	animalId: number
	species: string
	breed: string
	birthDate: dayjs.Dayjs
	gender: string
	color: string
}
