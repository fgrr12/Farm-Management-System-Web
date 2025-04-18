export interface FarmStore {
	farm: Farm | null
	setFarm: (farm: Farm | null) => void
}
