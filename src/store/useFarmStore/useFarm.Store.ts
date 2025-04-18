import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { FarmStore } from './useFarm.types'

export const useFarmStore = create<FarmStore>()(
	persist<FarmStore>(
		(set) => ({
			farm: null,
			setFarm: (farm) => set({ farm }),
		}),
		{
			name: 'farm-storage',
			storage: createJSONStorage(() => sessionStorage),
		}
	)
)
