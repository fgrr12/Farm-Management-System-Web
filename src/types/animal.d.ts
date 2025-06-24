interface Animal {
	uuid: string
	farmUuid: string
	speciesUuid: string
	breedUuid: string
	animalId: string
	gender: Gender
	color: string
	weight: number
	status: boolean
	origin: string
	picture?: string
	birthDate?: string
	purchaseDate?: string | null
	soldDate?: string | null
	deathDate?: string | null
	relatedAnimals?: RelatedAnimalList
	healthRecords?: HealthRecord[]
	productionRecords?: ProductionRecord[]
}
