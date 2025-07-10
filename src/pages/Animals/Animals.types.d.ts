export interface AnimalsFilters {
	speciesUuid: string
	gender: string
	status: string
	search: string
}

export interface AnimalCardProps extends Animal {
	speciesName: string
	breedName: string
}
