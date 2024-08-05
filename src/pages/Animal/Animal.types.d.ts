import type dayjs from 'dayjs'

export interface AnimalHealthRecord {
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

export interface ProductionRecord {
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

export interface AnimalInformation {
	uuid: string
	animalId: number
	species: Species
	breed: string
	gender: Gender
	color: string
	weight: number
	relatedAnimals: RelatedAnimalList
	status: boolean
	picture?: string
	healthRecords: AnimalHealthRecord[]
	productionRecords: ProductionRecord[]
	birthDate?: dayjs.Dayjs | string
	purchaseDate?: dayjs.Dayjs | string
	saleDate?: dayjs.Dayjs | string
	deathDate?: dayjs.Dayjs | string
}
