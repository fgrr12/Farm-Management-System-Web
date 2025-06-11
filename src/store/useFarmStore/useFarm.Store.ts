import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { BillingCardsService } from '@/services/billingCards'
import { BreedsService } from '@/services/breeds'
import { FarmsService } from '@/services/farms'
import { SpeciesService } from '@/services/species'

import type { FarmStore } from './useFarm.types'

export const useFarmStore = create<FarmStore>()(
	persist<FarmStore>(
		(set) => ({
			farm: null,
			billingCard: null,
			species: [],
			breeds: [],
			setFarm: (farm) => set({ farm }),
			setBillingCard: (card) => set({ billingCard: card }),
			setSpecies: (species) => set({ species }),
			setBreeds: (breeds) => set({ breeds }),
			async loadFarmData(farmUuid: string, role: string) {
				const farm = await FarmsService.getFarm(farmUuid)

				let billingCard = null
				if (farm.billingCardUuid && (role === 'admin' || role === 'owner')) {
					billingCard = await BillingCardsService.getBillingCardByUuid(farm.billingCardUuid)
				}

				const species = await SpeciesService.getAllSpecies(farm.uuid)
				const breeds = await BreedsService.getAllBreeds(farm.uuid)

				set({
					farm,
					billingCard,
					species,
					breeds,
				})
			},
		}),
		{
			name: 'farm-storage',
			storage: createJSONStorage(() => sessionStorage),
		}
	)
)
