import { useCallback, useEffect, useState } from 'react'

import { useFarmStore } from '@/store/useFarmStore'

import { DashboardService } from '@/services/dashboard'

export const useDashboardData = () => {
	const { farm } = useFarmStore()

	// Progressive loading states
	const [loading, setLoading] = useState(true)
	const [loadingSecondary, setLoadingSecondary] = useState(true)
	const [loadingTertiary, setLoadingTertiary] = useState(true)

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

	const fetchQuickData = useCallback(async () => {
		if (!farm?.uuid) {
			setLoading(false)
			return
		}

		try {
			setLoading(true)
			const quickStats = await DashboardService.getDashboardStats(farm.uuid)

			setStats((prevStats) => ({
				...prevStats,
				...quickStats,
			}))
		} catch (error) {
			console.error('Error fetching quick dashboard data:', error)
		} finally {
			setLoading(false)
		}
	}, [farm?.uuid])

	const fetchSecondaryData = useCallback(async () => {
		if (!farm?.uuid) {
			setLoadingSecondary(false)
			return
		}

		try {
			setLoadingSecondary(true)
			const phase2Data = await DashboardService.loadDashboardPhase2(farm.uuid)

			setHealthOverview(phase2Data.healthOverview)
			setTasksOverview(phase2Data.tasksOverview)

			setStats((prevStats) => ({
				...prevStats,
				healthyAnimals: phase2Data.healthOverview.healthy,
				pendingTasks: phase2Data.tasksOverview.pending + phase2Data.tasksOverview.inProgress,
				productionChange: phase2Data.productionStats.productionChange,
				monthlyProduction: phase2Data.productionStats.monthlyProduction,
			}))
		} catch (error) {
			console.error('Error fetching secondary dashboard data:', error)
		} finally {
			setLoadingSecondary(false)
		}
	}, [farm?.uuid])

	const fetchTertiaryData = useCallback(async () => {
		if (!farm?.uuid) {
			setLoadingTertiary(false)
			return
		}

		try {
			setLoadingTertiary(true)
			const phase3Data = await DashboardService.loadDashboardPhase3(farm.uuid)

			setProductionData(phase3Data.productionData)
			setAnimalDistribution(phase3Data.animalDistribution)
			setRecentActivities(phase3Data.recentActivities)
		} catch (error) {
			console.error('Error fetching tertiary dashboard data:', error)
		} finally {
			setLoadingTertiary(false)
		}
	}, [farm?.uuid])

	const fetchDashboardData = useCallback(async () => {
		await fetchQuickData()

		requestAnimationFrame(() => {
			setTimeout(() => {
				fetchSecondaryData()
			}, 50)
		})

		requestAnimationFrame(() => {
			setTimeout(() => {
				fetchTertiaryData()
			}, 200)
		})
	}, [fetchQuickData, fetchSecondaryData, fetchTertiaryData])

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
		loading, // Primary loading state (critical data)
		loadingSecondary, // Secondary data loading (health/tasks)
		loadingTertiary, // Tertiary data loading (charts/activities)
		refetch: fetchDashboardData,
	}
}
