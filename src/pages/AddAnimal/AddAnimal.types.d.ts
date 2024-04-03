import type dayjs from 'dayjs'

export interface AnimalForm {
	uuid: string
	animalId: number
	species: Species
	breed: string
	gender: Gender
	color: string
	weight: number
	picture?: string
	birthDate?: dayjs.Dayjs
	purchaseDate?: dayjs.Dayjs
	relatedAnimals: {
		children: []
		parents: []
	}
	healthRecords: []
	productionRecords: []
}
