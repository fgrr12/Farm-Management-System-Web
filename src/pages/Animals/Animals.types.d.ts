import type dayjs from 'dayjs'

export interface AnimalCardInformation {
	uuid: string
	animalId: number
	species: string
	breed: string
	birthDate: dayjs.Dayjs
	gender: string
	color: string
}
