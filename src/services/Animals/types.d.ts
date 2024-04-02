import type dayjs from 'dayjs'

export interface GetAnimalsProps {
	selectedSpecies: string
	search: string
}

export interface GetAnimalsResponse {
	uuid: string
	animalId: number
	species: string
	breed: string
	birthDate: dayjs.Dayjs
	gender: string
	color: string
}
