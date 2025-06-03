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
	healthRecords?: AnimalHealthRecord[]
	productionRecords?: ProductionRecord[]
}

interface RelatedAnimalList {
	parents: Relation[]
	children: Relation[]
}

interface AnimalHealthRecord {
	uuid: string
	animalUuid: string
	reason: string
	notes: string
	type: HealthRecordType
	reviewedBy: string
	createdBy: string
	date: string
	status: boolean
	weight?: number
	temperature?: number
	medication?: string
	dosage?: string
	frequency?: string
	duration?: string
	createdAt?: string
	updatedAt?: string
}

interface ProductionRecord {
	uuid: string
	animalUuid: string
	date: string
	quantity: number
	notes: string
	status: boolean
	createdAt?: string
	updatedAt?: string
}
