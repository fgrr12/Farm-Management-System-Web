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
	healthStatus: HealthStatus
	picture?: string
	birthDate?: string
	purchaseDate?: string | null
	soldDate?: string | null
	deathDate?: string | null
	relatedAnimals?: RelatedAnimalList
	healthRecords?: HealthRecord[]
	productionRecords?: ProductionRecord[]
	createdAt?: string
	updatedAt?: string
}
