import { useCallback } from 'react'

import {
	useDashboardPhase2,
	useDashboardPhase3,
	useDashboardStats,
} from '@/hooks/queries/useDashboard'

export const useDashboardData = () => {
	// Phase 1: Quick Stats (Critical data)
	const { data: quickStats, isLoading: loading, refetch: refetchStats } = useDashboardStats()

	// Phase 2: Health & Tasks (Secondary data)
	const {
		data: phase2Data,
		isLoading: loadingSecondary,
		refetch: refetchPhase2,
	} = useDashboardPhase2()

	// Phase 3: Charts & Activities (Tertiary data)
	const {
		data: phase3Data,
		isLoading: loadingTertiary,
		refetch: refetchPhase3,
	} = useDashboardPhase3()

	// Combine refetches
	const refetch = useCallback(async () => {
		await Promise.all([refetchStats(), refetchPhase2(), refetchPhase3()])
	}, [refetchStats, refetchPhase2, refetchPhase3])

	// Default values matching the original state structure
	const stats: DashboardStats = {
		totalAnimals: quickStats?.totalAnimals || 0,
		healthyAnimals: phase2Data?.healthOverview?.healthy || quickStats?.healthyAnimals || 0,
		pendingTasks:
			(phase2Data?.tasksOverview?.pending || 0) + (phase2Data?.tasksOverview?.inProgress || 0) ||
			quickStats?.pendingTasks ||
			0,
		monthlyProduction:
			phase2Data?.productionStats?.monthlyProduction || quickStats?.monthlyProduction || 0,
		animalsChange: quickStats?.animalsChange,
		healthChange: quickStats?.healthChange,
		tasksChange: quickStats?.tasksChange,
		productionChange: phase2Data?.productionStats?.productionChange || quickStats?.productionChange,
	}

	const healthOverview: HealthOverview = phase2Data?.healthOverview || {
		healthy: 0,
		sick: 0,
		inTreatment: 0,
		checkupDue: 0,
	}

	const tasksOverview: TasksOverview = phase2Data?.tasksOverview || {
		pending: 0,
		inProgress: 0,
		completed: 0,
	}

	const productionData: ProductionData[] = phase3Data?.productionData || []
	const animalDistribution: AnimalDistribution[] = phase3Data?.animalDistribution || []
	const recentActivities: RecentActivity[] = phase3Data?.recentActivities || []

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
		refetch,
	}
}
