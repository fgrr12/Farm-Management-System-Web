import type dayjs from 'dayjs'

export interface IAnimalCard {
	uuid: string
	animalId: number
	species: string
	breed: string
	birthDate: dayjs.Dayjs
	gender: string
	color: string
}
