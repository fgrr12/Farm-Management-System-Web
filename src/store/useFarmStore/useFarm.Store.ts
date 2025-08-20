import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { FarmsService } from '@/services/farms'

import type { FarmStore } from './useFarm.types'

export const useFarmStore = create<FarmStore>()(
	persist<FarmStore>(
		(set) => ({
			farm: null,
			taxDetails: null,
			species: [],
			breeds: [],
			setFarm: (farm) => set({ farm }),
			setTaxDetails: (taxDetails) => set({ taxDetails }),
			setSpecies: (species) => set({ species }),
			setBreeds: (breeds) => set({ breeds }),
			async loadFarmData(farmUuid: string, role: string) {
				// 🚀 OPTIMIZACIÓN: Una sola llamada en lugar de 4 separadas
				const bulkData = await FarmsService.loadFarmBulkData(farmUuid, role)

				set({
					farm: bulkData.farm,
					taxDetails: bulkData.taxDetails,
					species: bulkData.species,
					breeds: bulkData.breeds,
				})
			},
			async loadFarmDataPublic(farmUuid: string) {
				// 🚀 ACCESO PÚBLICO: Para compartir enlaces de venta sin autenticación
				const bulkData = await FarmsService.loadFarmBulkDataPublic(farmUuid)

				set({
					farm: bulkData.farm,
					taxDetails: null, // Never include tax details for public access
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
