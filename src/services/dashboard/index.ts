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

const getDashboardStatsDetailed = async (farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('dashboard', {
		operation: 'getDashboardStatsDetailed',
		farmUuid,
	})
	return response.data
}

const getProductionData = async (farmUuid: string, year?: number) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('dashboard', {
		operation: 'getProductionData',
		farmUuid,
		year,
	})
	return response.data
}

const getAnimalDistribution = async (farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('dashboard', {
		operation: 'getAnimalDistribution',
		farmUuid,
	})
	return response.data
}

const getHealthOverview = async (farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('dashboard', {
		operation: 'getHealthOverview',
		farmUuid,
	})
	return response.data
}

const getTasksOverview = async (farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('dashboard', {
		operation: 'getTasksOverview',
		farmUuid,
	})
	return response.data
}

const getRecentActivities = async (farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any[]; count: number }>(
		'dashboard',
		{
			operation: 'getRecentActivities',
			farmUuid,
		}
	)
	return response.data
}

const getDashboardQuickStats = async (farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('dashboard', {
		operation: 'getDashboardQuickStats',
		farmUuid,
	})
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
	getDashboardStatsDetailed,
	getProductionData,
	getAnimalDistribution,
	getHealthOverview,
	getTasksOverview,
	getRecentActivities,
	getDashboardQuickStats,
	loadDashboardPhase2,
	loadDashboardPhase3,
}
