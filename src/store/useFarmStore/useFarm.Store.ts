import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { FarmsService } from '@/services/farms'

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
				// 🚀 OPTIMIZACIÓN: Una sola llamada en lugar de 4 separadas
				const bulkData = await FarmsService.loadFarmBulkData(farmUuid, role)

				set({
					farm: bulkData.farm,
					billingCard: bulkData.billingCard,
					species: bulkData.species,
					breeds: bulkData.breeds,
				})
			},
			async loadFarmDataPublic(farmUuid: string) {
				// 🚀 ACCESO PÚBLICO: Para compartir enlaces de venta sin autenticación
				const bulkData = await FarmsService.loadFarmBulkDataPublic(farmUuid)

				set({
					farm: bulkData.farm,
					billingCard: null, // Never include billing card for public access
					species: bulkData.species,
					breeds: bulkData.breeds,
				})
			},
		}),
		{
			name: 'farm-storage',
			storage: createJSONStorage(() => sessionStorage),
		}
	)
)
