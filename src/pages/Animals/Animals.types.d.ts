export interface AnimalsFilters {
	speciesUuid: string
	search: string
}

export interface AnimalCardProps extends Animal {
	speciesName: string
	breedName: string
}
