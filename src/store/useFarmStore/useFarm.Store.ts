import { create } from 'zustand'
import type { FarmStore, FarmStoreActions } from './useFarm.types'

export const useFarmStore = create<FarmStore & FarmStoreActions>((set) => ({
	farm: null,
	setFarm: (farm) => set({ farm }),
}))
