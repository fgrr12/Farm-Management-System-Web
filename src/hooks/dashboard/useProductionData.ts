import { useDashboardPhase3 } from '@/hooks/queries/useDashboard'

export const useProductionData = (year?: number) => {
	const { data: phase3Data, isLoading: loading, refetch } = useDashboardPhase3(year)

	return {
		productionData: phase3Data?.productionData || [],
		loading,
		refetch,
	}
}
