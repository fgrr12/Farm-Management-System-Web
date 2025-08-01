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
			const data = await DashboardService.getProductionData(farm.uuid, year)
			setProductionData(data)
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
