interface Animal {
	uuid: string
	animalId: string
	species: {
		uuid: string
		name: string
	}
	breed: Breed
	gender: Gender
	color: string
	weight: number
	status: boolean
	farmUuid: string
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
