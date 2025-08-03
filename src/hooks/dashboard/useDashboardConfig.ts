import { useMemo } from 'react'

import { useUserStore } from '@/store/useUserStore'

export type DashboardWidget =
	| 'stats'
	| 'production'
	| 'animalDistribution'
	| 'healthOverview'
	| 'tasksOverview'
	| 'recentActivities'
	// Future role-specific widgets
	| 'financials'
	| 'employeeMetrics'
	| 'reports'
	| 'myTasks'
	| 'myAnimals'

export interface DashboardConfig {
	widgets: DashboardWidget[]
	layout: {
		[key in DashboardWidget]?: {
			order: number
			colSpan?: string
			rowSpan?: string
		}
	}
}

/**
 * Hook that configures which widgets to show in the dashboard based on user role
 *
 * To add new role-specific widgets:
 * 1. Add the widget to the DashboardWidget type
 * 2. Add it to the widgets array for the corresponding role
 * 3. Define its layout (order, colSpan, etc.)
 * 4. Implement the rendering in DashboardGrid
 */
export const useDashboardConfig = (): DashboardConfig => {
	const { user } = useUserStore()

	return useMemo(() => {
		// Base widgets that everyone can see
		const baseWidgets: DashboardWidget[] = [
			'stats',
			'production',
			'animalDistribution',
			'healthOverview',
			'tasksOverview',
			'recentActivities',
		]

		// Base layout for all current widgets
		const baseLayout = {
			stats: { order: 0 }, // Rendered in the header
			production: { order: 1, colSpan: 'xl:col-span-2' },
			animalDistribution: { order: 3, colSpan: 'xl:col-span-1' },
			healthOverview: { order: 2, colSpan: 'lg:col-span-1' },
			tasksOverview: { order: 4, colSpan: 'lg:col-span-1' },
			recentActivities: { order: 5, colSpan: 'lg:col-span-2 xl:col-span-1' },
		}

		switch (user?.role) {
			case 'employee':
				return {
					widgets: baseWidgets,
					layout: baseLayout,
				}

			case 'owner':
			case 'admin':
				// Same as employee for now, but prepared for future widgets
				return {
					widgets: [
						...baseWidgets,
						// Future widgets for owner/admin:
						// 'financials',
						// 'employeeMetrics',
						// 'reports'
					],
					layout: {
						...baseLayout,
						// Future specific layouts:
						// financials: { order: 6, colSpan: 'lg:col-span-2' },
						// employeeMetrics: { order: 7, colSpan: 'lg:col-span-1' },
						// reports: { order: 8, colSpan: 'lg:col-span-1' },
					},
				}

			default:
				return {
					widgets: baseWidgets,
					layout: baseLayout,
				}
		}
	}, [user?.role])
}
