import type dayjs from 'dayjs'

export interface RelatedAnimalInformation {
	uuid: string
	animalId: number
	breed: string
	gender: string
	picture?: string
}

export interface RelatedAnimalsLists {
	animalUuid: string
	animals: RelatedAnimalInformation[]
	parent: RelatedAnimalInformation[]
	children: RelatedAnimalInformation[]
}

export interface RelatedAnimalsList {
	uuid: string
	parent: SelectedAnimal
	child: SelectedAnimal
	createdAt?: dayjs.Dayjs | string
	updatedAt?: dayjs.Dayjs | string
}

interface SelectedAnimal {
	animalUuid: string
	animalId: number
	breed: string
	relation: string
}
