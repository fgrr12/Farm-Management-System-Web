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
	uuid: string
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

declare interface ProductionRecord {
	uuid: string
	animalUuid: string
	date: dayjs.Dayjs | string
	quantity: number
	notes: string
}

interface RelatedAnimal {
	uuid: string
	parent: {
		animalUuid: string
		animalId: number
		breed: string
		relation: string
	}
	child: {
		animalUuid: string
		animalId: number
		breed: string
		relation: string
	}
	createdAt?: dayjs.Dayjs | string
	updatedAt?: dayjs.Dayjs | string
}

interface RelatedAnimalList {
	parents: RelatedAnimal[]
	children: RelatedAnimal[]
}

export interface GetAnimalResponse {
	uuid: string
	animalId: number
	species: Species
	breed: string
	gender: Gender
	color: string
	weight: number
	relatedAnimals: RelatedAnimalList
	picture?: string
	healthRecords: AnimalHealthRecord[]
	productionRecords: ProductionRecord[]
	birthDate?: dayjs.Dayjs
	purchaseDate?: dayjs.Dayjs
	soldDate?: dayjs.Dayjs
	deathDate?: dayjs.Dayjs
}
