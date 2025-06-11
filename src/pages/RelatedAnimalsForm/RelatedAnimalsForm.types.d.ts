export type DragRelationTypes = 'animals' | 'parents' | 'children'

export type DragSingularRelation = 'parent' | 'child'

export interface RelatedAnimalInformation {
	uuid: string
	animalId: string
	breed: string
	gender: Gender
	location?: number
	picture?: string
}

export interface RelatedAnimalsLists {
	animals: RelatedAnimalInformation[]
	parents: RelatedAnimalInformation[]
	children: RelatedAnimalInformation[]
}

export interface RelatedAnimalsList {
	uuid: string
	parent: SelectedAnimal
	child: SelectedAnimal
	createdAt?: string
	updatedAt?: string
}

interface SelectedAnimal {
	animalUuid: string
	animalId: string
	breed: Breed
	relation: string
}
