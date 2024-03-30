import type dayjs from 'dayjs'

export interface RelatedAnimal {
	animalId: number
	species: Species
	breed: string
	gender: Gender
	relation: Relation
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

export interface RelatedAnimals {
	children?: RelatedAnimal[]
	parents?: RelatedAnimal[]
}

export interface AnimalInformation {
	animalId: number
	species: Species
	breed: string
	gender: Gender
	color: string
	weight: number
	relatedAnimals: RelatedAnimals
	picture?: string
	healthRecords?: AnimalHealthRecord[]
	birthDate?: dayjs.Dayjs
	purchaseDate?: dayjs.Dayjs
	soldDate?: dayjs.Dayjs
	deathDate?: dayjs.Dayjs
}
