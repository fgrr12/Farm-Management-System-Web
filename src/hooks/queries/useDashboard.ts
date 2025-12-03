import { useQuery } from '@tanstack/react-query'

import { useFarmStore } from '@/store/useFarmStore'

import { DashboardService } from '@/services/dashboard'

export const DASHBOARD_KEYS = {
	all: ['dashboard'] as const,
	stats: (farmUuid: string) => [...DASHBOARD_KEYS.all, 'stats', farmUuid] as const,
	phase2: (farmUuid: string) => [...DASHBOARD_KEYS.all, 'phase2', farmUuid] as const,
	phase3: (farmUuid: string, year?: number) =>
		[...DASHBOARD_KEYS.all, 'phase3', farmUuid, year] as const,
}

export const useDashboardStats = () => {
	const { farm } = useFarmStore()
	const farmUuid = farm?.uuid || ''

	return useQuery({
		queryKey: DASHBOARD_KEYS.stats(farmUuid),
		queryFn: () => DashboardService.getDashboardStats(farmUuid),
		enabled: !!farmUuid,
		staleTime: 30000, // 30 seconds - dashboard data changes frequently
	})
}

export const useDashboardPhase2 = () => {
	const { farm } = useFarmStore()
	const farmUuid = farm?.uuid || ''

	return useQuery({
		queryKey: DASHBOARD_KEYS.phase2(farmUuid),
		queryFn: () => DashboardService.loadDashboardPhase2(farmUuid),
		enabled: !!farmUuid,
		staleTime: 30000,
	})
}

export const useDashboardPhase3 = (year?: number) => {
	const { farm } = useFarmStore()
	const farmUuid = farm?.uuid || ''

	return useQuery({
		queryKey: DASHBOARD_KEYS.phase3(farmUuid, year),
		queryFn: () => DashboardService.loadDashboardPhase3(farmUuid, year),
		enabled: !!farmUuid,
		staleTime: 60000, // 1 minute - historical data changes less frequently
	})
}
