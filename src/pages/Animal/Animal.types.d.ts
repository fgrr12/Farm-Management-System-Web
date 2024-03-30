import type dayjs from 'dayjs'

export interface IAnimal {
	animalId: number
	species: string
	breed: string
	gender: string
	color: string
	weight: number
	picture?: string
	relatedAnimal?: RelatedAnimal[]
	healthRecords?: AnimalHealthRecord[]
	birthDate?: dayjs.Dayjs
	purchaseDate?: dayjs.Dayjs
}
export interface RelatedAnimal {
	animalId: number
	species: string
	breed: string
	gender: string
	relation: string
}

export interface AnimalHealthRecord {
	animalId: number
	reason: string
	notes: string
	type: string
	reviewedBy: string
	date: dayjs.Dayjs
	weight?: number
	temperature?: number
	heartRate?: number
	bloodPressure?: number
	medication?: string
	dosage?: string
	frequency?: string
	duration?: string
}
