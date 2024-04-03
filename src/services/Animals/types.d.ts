import type dayjs from 'dayjs'

export interface GetAnimalsProps {
	selectedSpecies: string
	search: string
}

export interface GetAnimalProps {
	animalUuid: string
}

declare type healthRecordType =
	| 'Checkup'
	| 'Vaccination'
	| 'Medication'
	| 'Surgery'
	| 'Pregnant'
	| 'Deworming'
	| 'Birth'

declare interface RelatedAnimal {
	animalId: number
	breed: string
	relation: Relation
}

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
	birthDate?: dayjs.Dayjs
	purchaseDate?: dayjs.Dayjs
	soldDate?: dayjs.Dayjs
	deathDate?: dayjs.Dayjs
}
