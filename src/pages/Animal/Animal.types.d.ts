import type dayjs from 'dayjs'

export interface AnimalHealthRecord {
	animalUuid: string
	reason: string
	notes: string
	type: string
	reviewedBy: string
	date: dayjs.Dayjs | string
	weight?: number
	temperature?: number
	medication?: string
	dosage?: string
	frequency?: string
	duration?: string
}

export interface ProductionRecord {
	animalId: number
	date: dayjs.Dayjs
	quantity: number
	notes: string
}

export interface RelatedAnimal {
	animalId: number
	breed: string
	relation: Relation
}

export interface RelatedAnimals {
	children: RelatedAnimal[]
	parents: RelatedAnimal[]
}

export interface AnimalInformation {
	uuid: string
	animalId: number
	species: Species
	breed: string
	gender: Gender
	color: string
	weight: number
	relatedAnimals: RelatedAnimals
	picture?: string
	healthRecords: AnimalHealthRecord[]
	productionRecords: ProductionRecord[]
	birthDate?: dayjs.Dayjs
	purchaseDate?: dayjs.Dayjs
	soldDate?: dayjs.Dayjs
	deathDate?: dayjs.Dayjs
}
