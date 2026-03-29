import type { Relationship } from './global'

export interface Relation {
	uuid: string
	parent: RelatedAnimal
	child: RelatedAnimal
	createdAt?: string
	updatedAt?: string
}

export interface RelatedAnimal {
	animalUuid: string
	animalId: string
	breed: string
	relation: Relationship
}

export interface RelatedAnimalList {
	parents: Relation[]
	children: Relation[]
}
