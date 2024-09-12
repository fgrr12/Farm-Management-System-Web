export interface GetRelatedAnimalsResponse {
	uuid: string
	parent: SelectedAnimal
	child: SelectedAnimal
	createdAt?: string
	updatedAt?: string
}

export interface SetRelatedAnimalProps {
	uuid: string
	parent: SelectedAnimal | null
	child: SelectedAnimal | null
	createdAt?: string
	updatedAt?: string
}

interface SelectedAnimal {
	animalUuid: string
	animalId: string
	breed: Breed
	relation: string
}
