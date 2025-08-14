import { useCallback, useEffect, useState } from 'react'

import { useFarmStore } from '@/store/useFarmStore'

import { DashboardService } from '@/services/dashboard'

export const useProductionData = (year?: number) => {
	const { farm } = useFarmStore()
	const [loading, setLoading] = useState(true)
	const [productionData, setProductionData] = useState<ProductionData[]>([])

	const fetchProductionData = useCallback(async () => {
		if (!farm?.uuid) {
			setLoading(false)
			return
		}

		try {
			setLoading(true)
			const phase3Data = await DashboardService.loadDashboardPhase3(farm.uuid, year)
			setProductionData(phase3Data.productionData)
		} catch (error) {
			console.error('Error fetching production data:', error)
			setProductionData([])
		} finally {
			setLoading(false)
		}
	}, [farm?.uuid, year])

	useEffect(() => {
		fetchProductionData()
	}, [fetchProductionData])

	return {
		productionData,
		loading,
		refetch: fetchProductionData,
	}
}
