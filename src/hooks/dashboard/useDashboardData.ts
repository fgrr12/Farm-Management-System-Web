import { useCallback, useEffect, useState } from 'react'

import { useFarmStore } from '@/store/useFarmStore'

import { DashboardService } from '@/services/dashboard'

interface DashboardStats {
	totalAnimals: number
	healthyAnimals: number
	pendingTasks: number
	monthlyProduction: number
	animalsChange?: number
	healthChange?: number
	tasksChange?: number
	productionChange?: number
}

interface ProductionData {
	month: string
	value: number
}

interface AnimalDistribution {
	species: string
	count: number
}

interface HealthOverview {
	healthy: number
	sick: number
	inTreatment: number
	checkupDue: number
}

interface TasksOverview {
	pending: number
	inProgress: number
	completed: number
}

interface RecentActivity {
	type: string
	title: string
	description: string
	time: string
	user: string
}

export const useDashboardData = () => {
	const { farm } = useFarmStore()
	const [loading, setLoading] = useState(true)

	const [stats, setStats] = useState<DashboardStats>({
		totalAnimals: 0,
		healthyAnimals: 0,
		pendingTasks: 0,
		monthlyProduction: 0,
		animalsChange: undefined,
		healthChange: undefined,
		tasksChange: undefined,
		productionChange: undefined,
	})

	const [productionData, setProductionData] = useState<ProductionData[]>([])
	const [animalDistribution, setAnimalDistribution] = useState<AnimalDistribution[]>([])
	const [healthOverview, setHealthOverview] = useState<HealthOverview>({
		healthy: 0,
		sick: 0,
		inTreatment: 0,
		checkupDue: 0,
	})
	const [tasksOverview, setTasksOverview] = useState<TasksOverview>({
		pending: 0,
		inProgress: 0,
		completed: 0,
	})
	const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])

	const fetchDashboardData = useCallback(async () => {
		if (!farm?.uuid) {
			setLoading(false)
			return
		}

		try {
			setLoading(true)

			// Fetch all dashboard data in parallel
			const [
				statsData,
				productionDataResult,
				animalDistributionResult,
				healthOverviewResult,
				tasksOverviewResult,
				recentActivitiesResult,
			] = await Promise.all([
				DashboardService.getDashboardStats(farm.uuid),
				DashboardService.getProductionData(farm.uuid),
				DashboardService.getAnimalDistribution(farm.uuid),
				DashboardService.getHealthOverview(farm.uuid),
				DashboardService.getTasksOverview(farm.uuid),
				DashboardService.getRecentActivities(farm.uuid),
			])

			setStats(statsData)
			setProductionData(productionDataResult)
			setAnimalDistribution(animalDistributionResult)
			setHealthOverview(healthOverviewResult)
			setTasksOverview(tasksOverviewResult)
			setRecentActivities(recentActivitiesResult)
		} catch (error) {
			console.error('Error fetching dashboard data:', error)
			// Keep current state on error, don't reset to empty
		} finally {
			setLoading(false)
		}
	}, [farm?.uuid])

	useEffect(() => {
		fetchDashboardData()
	}, [fetchDashboardData])

	return {
		stats,
		productionData,
		animalDistribution,
		healthOverview,
		tasksOverview,
		recentActivities,
		loading,
		refetch: fetchDashboardData,
	}
}
