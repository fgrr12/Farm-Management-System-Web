import { memo } from 'react'

import { AnimalDistribution } from '@/components/business/Dashboard/AnimalDistribution'
import { HealthOverview } from '@/components/business/Dashboard/HealthOverview'
import { ProductionChart } from '@/components/business/Dashboard/ProductionChart'
import { RecentActivities } from '@/components/business/Dashboard/RecentActivities'
import { TasksOverview } from '@/components/business/Dashboard/TasksOverview'

import { type DashboardWidget, useDashboardConfig } from '@/hooks/dashboard/useDashboardConfig'

import type { DashboardGridProps } from './DashboardGrid.types'

export const DashboardGrid = memo<DashboardGridProps>(() => {
	const { widgets, layout } = useDashboardConfig()

	const renderWidget = (widget: DashboardWidget) => {
		const widgetLayout = layout[widget]
		const className = `${widgetLayout?.colSpan || ''} order-${widgetLayout?.order || 0}`

		switch (widget) {
			case 'stats':
				return null

			case 'production':
				return (
					<div key={widget} className={className}>
						<ProductionChart />
					</div>
				)

			case 'animalDistribution':
				return (
					<div key={widget} className={className}>
						<AnimalDistribution />
					</div>
				)

			case 'healthOverview':
				return (
					<div key={widget} className={className}>
						<HealthOverview />
					</div>
				)

			case 'tasksOverview':
				return (
					<div key={widget} className={className}>
						<TasksOverview />
					</div>
				)

			case 'recentActivities':
				return (
					<div key={widget} className={className}>
						<RecentActivities />
					</div>
				)

			case 'financials':
				return (
					<div key={widget} className={className}>
						<div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
							<h3 className="text-lg font-semibold">Financials (Coming Soon)</h3>
						</div>
					</div>
				)

			case 'employeeMetrics':
				return (
					<div key={widget} className={className}>
						<div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
							<h3 className="text-lg font-semibold">Employee Metrics (Coming Soon)</h3>
						</div>
					</div>
				)

			case 'reports':
				return (
					<div key={widget} className={className}>
						<div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
							<h3 className="text-lg font-semibold">Reports (Coming Soon)</h3>
						</div>
					</div>
				)

			case 'myTasks':
				return (
					<div key={widget} className={className}>
						<div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
							<h3 className="text-lg font-semibold">My Tasks (Coming Soon)</h3>
						</div>
					</div>
				)

			case 'myAnimals':
				return (
					<div key={widget} className={className}>
						<div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
							<h3 className="text-lg font-semibold">My Animals (Coming Soon)</h3>
						</div>
					</div>
				)

			default:
				return null
		}
	}

	const gridWidgets = widgets
		.filter((widget) => widget !== 'stats')
		.sort((a, b) => (layout[a]?.order || 0) - (layout[b]?.order || 0))

	return (
		<section
			aria-label="Dashboard Charts and Overview"
			className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
		>
			{gridWidgets.map(renderWidget)}
		</section>
	)
})

DashboardGrid.displayName = 'DashboardGrid'
