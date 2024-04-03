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
