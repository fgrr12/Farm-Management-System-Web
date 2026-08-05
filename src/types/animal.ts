import type { Gender, HealthStatus } from './global'
import type { HealthRecord } from './healthRecord'
import type { ProductionRecord } from './productionRecord'
import type { RelatedAnimalList } from './relation'

export interface Animal {
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
	/** Set client-side while this write is still queued waiting for a connection; never sent to or read from the server. */
	pendingSync?: boolean
}
