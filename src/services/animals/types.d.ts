import type dayjs from 'dayjs'

export interface GetAnimalsProps {
	selectedSpecies: string
	search: string
	farmUuid: string | null
}

export interface SetAnimalProps {
	uuid: string
	animalId: string
	species: string
	breed: string
	gender: string
	color: string
	weight: number
	status: boolean
	picture?: string
	birthDate?: dayjs.Dayjs | string
	purchaseDate?: dayjs.Dayjs | string
	soldDate?: dayjs.Dayjs | string | null
	deathDate?: dayjs.Dayjs | string | null
}

declare type healthRecordType =
	| 'Checkup'
	| 'Vaccination'
	| 'Medication'
	| 'Surgery'
	| 'Pregnancy'
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
		animalId: string
		breed: string
		relation: string
	}
	child: {
		animalUuid: string
		animalId: string
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
	animalId: string
	species: string
	breed: string
	gender: Gender
	color: string
	weight: number
	relatedAnimals: RelatedAnimalList
	status: boolean
	farmUuid: string
	healthRecords: AnimalHealthRecord[]
	productionRecords: ProductionRecord[]
	picture?: string
	birthDate?: dayjs.Dayjs
	purchaseDate?: dayjs.Dayjs
	soldDate?: dayjs.Dayjs
	deathDate?: dayjs.Dayjs
}
