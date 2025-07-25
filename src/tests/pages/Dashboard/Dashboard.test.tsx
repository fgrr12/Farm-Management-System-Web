import { describe, expect, it, vi } from 'vitest'

import Dashboard from '@/pages/Dashboard/Dashboard.page'

import { render, screen } from '@/tests/utils/test-utils'

// Mock the dashboard hooks
vi.mock('@/hooks/dashboard/useDashboardData', () => ({
	useDashboardData: () => ({
		stats: {
			totalAnimals: 25,
			healthyAnimals: 23,
			pendingTasks: 5,
			monthlyProduction: 1250,
			animalsChange: 5.2,
			healthChange: 2.1,
			tasksChange: -8.3,
			productionChange: 12.5,
		},
		productionData: [
			{ month: 'Jan', value: 200 },
			{ month: 'Feb', value: 250 },
			{ month: 'Mar', value: 300 },
		],
		animalDistribution: [
			{ species: 'Cattle', count: 15 },
			{ species: 'Sheep', count: 10 },
		],
		healthOverview: {
			healthy: 23,
			sick: 2,
			inTreatment: 1,
			checkupDue: 3,
		},
		tasksOverview: {
			pending: 5,
			inProgress: 3,
			completed: 12,
		},
		recentActivities: [
			{
				type: 'health_record',
				title: '💉 Vacunación',
				description: 'Cow #123 - Vacunación rutinaria',
				time: '2024-01-15',
				user: 'Personal de Granja',
			},
		],
		loading: false,
	}),
}))

// Mock the production data hook
vi.mock('@/hooks/dashboard/useProductionData', () => ({
	useProductionData: () => ({
		productionData: [
			{ month: 'Jan', value: 200 },
			{ month: 'Feb', value: 250 },
			{ month: 'Mar', value: 300 },
		],
		loading: false,
		refetch: vi.fn(),
	}),
}))

describe('Dashboard', () => {
	it('should render dashboard title', () => {
		render(<Dashboard />)

		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
	})

	it('should render stats cards', () => {
		render(<Dashboard />)

		expect(screen.getAllByText('25')).toHaveLength(2) // Total animals (appears in stats and distribution)
		expect(screen.getAllByText('23')).toHaveLength(2) // Healthy animals (appears in stats and health overview)
		expect(screen.getAllByText('5')).toHaveLength(2) // Pending tasks (appears in stats and tasks overview)
		expect(screen.getByText('1250L')).toBeInTheDocument() // Monthly production
	})

	it('should render production chart', () => {
		render(<Dashboard />)

		expect(screen.getAllByText('200L')).toHaveLength(2) // Appears in chart and tooltip
		expect(screen.getAllByText('250L')).toHaveLength(2) // Appears in chart and tooltip
		expect(screen.getAllByText('300L')).toHaveLength(2) // Appears in chart and tooltip
	})

	it('should render animal distribution', () => {
		render(<Dashboard />)

		expect(screen.getByText('Cattle')).toBeInTheDocument()
		expect(screen.getByText('Sheep')).toBeInTheDocument()
		expect(screen.getByText('15')).toBeInTheDocument()
		expect(screen.getByText('10')).toBeInTheDocument()
	})

	it('should render health overview', () => {
		render(<Dashboard />)

		// Health numbers should be visible
		expect(screen.getAllByText('23')).toHaveLength(2) // Healthy count appears twice
		expect(screen.getByText('2')).toBeInTheDocument() // Sick count
	})

	it('should render tasks overview', () => {
		render(<Dashboard />)

		expect(screen.getAllByText('5')).toHaveLength(2) // Pending tasks appears twice
		expect(screen.getAllByText('3')).toHaveLength(2) // In progress (appears in tasks and health overview)
		expect(screen.getByText('12')).toBeInTheDocument() // Completed
	})

	it('should render recent activities', () => {
		render(<Dashboard />)

		expect(screen.getByText('💉 Vacunación')).toBeInTheDocument()
		expect(screen.getByText('Cow #123 - Vacunación rutinaria')).toBeInTheDocument()
	})

	it('should render dashboard without errors', () => {
		render(<Dashboard />)

		// Basic check that dashboard renders
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
	})
})
