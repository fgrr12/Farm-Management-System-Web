import { callableFireFunction } from '@/utils/callableFireFunction'

const getDashboardStats = async (farmUuid: string): Promise<DashboardStats> => {
	const response = await callableFireFunction<{ success: boolean; data: DashboardStats }>(
		'dashboard',
		{
			operation: 'getDashboardStats',
			farmUuid,
		}
	)
	return response.data
}

const loadDashboardPhase2 = async (farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('dashboard', {
		operation: 'loadDashboardPhase2',
		farmUuid,
	})
	return response.data
}

const loadDashboardPhase3 = async (farmUuid: string, year?: number) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('dashboard', {
		operation: 'loadDashboardPhase3',
		farmUuid,
		year,
	})
	return response.data
}

export const DashboardService = {
	getDashboardStats,
	loadDashboardPhase2,
	loadDashboardPhase3,
}
