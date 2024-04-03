import type dayjs from 'dayjs'

export interface GetAnimalsProps {
	selectedSpecies: string
	search: string
}

export interface GetAnimalProps {
	animalUuid: string
}

export interface SetAnimalProps {
	uuid: string
	animalId: number
	species: string
	breed: string
	gender: string
	color: string
	weight: number
	picture?: string
	birthDate?: dayjs.Dayjs | string
	purchaseDate?: dayjs.Dayjs | string
	relatedAnimals: {
		children: []
		parents: []
	}
	healthRecords: []
	productionRecords: []
}

declare type healthRecordType =
	| 'Checkup'
	| 'Vaccination'
	| 'Medication'
	| 'Surgery'
	| 'Pregnant'
	| 'Deworming'
	| 'Birth'

declare interface AnimalHealthRecord {
	animalId: number
	reason: string
	notes: string
	type: string
	reviewedBy: string
	date: dayjs.Dayjs
	weight?: number
	temperature?: number
	medication?: string
	dosage?: string
	frequency?: string
	duration?: string
}

declare interface ProductionRecord {
	animalId: number
	date: dayjs.Dayjs
	quantity: number
	notes: string
}

declare interface RelatedAnimal {
	animalId: number
	breed: string
	relation: Relation
}

declare interface RelatedAnimals {
	children: RelatedAnimal[]
	parents: RelatedAnimal[]
}

export interface GetAnimalResponse {
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
