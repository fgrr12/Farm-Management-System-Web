export interface FarmStore {
	farm: Farm | null
}

export interface FarmStoreActions {
	setFarm: (farm: Farm | null) => void
}
