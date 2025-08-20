export interface FarmStore {
	farm: Farm | null
	taxDetails: TaxDetails | null
	species: Species[]
	breeds: Breed[]
	setFarm: (farm: Farm | null) => void
	setTaxDetails: (taxDetails: TaxDetails | null) => void
	setSpecies: (species: Species[]) => void
	setBreeds: (breeds: Breed[]) => void
	loadFarmData: (farmUuid: string, role: string) => Promise<void>
	loadFarmDataPublic: (farmUuid: string) => Promise<void>
}
