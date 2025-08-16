export interface FarmStore {
	farm: Farm | null
	billingCard: BillingCard | null
	species: Species[]
	breeds: Breed[]
	setFarm: (farm: Farm | null) => void
	setBillingCard: (card: BillingCard | null) => void
	setSpecies: (species: Species[]) => void
	setBreeds: (breeds: Breed[]) => void
	loadFarmData: (farmUuid: string, role: string) => Promise<void>
	loadFarmDataPublic: (farmUuid: string) => Promise<void>
}
