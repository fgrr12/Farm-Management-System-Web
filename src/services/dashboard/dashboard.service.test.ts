import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DashboardService } from './index'

// Mock the services
vi.mock('@/services/animals', () => ({
	AnimalsService: {
		getAnimals: vi.fn(),
		getAnimalsWithHealthStatus: vi.fn(),
	},
}))

vi.mock('@/services/healthRecords', () => ({
	HealthRecordsService: {
		getHealthRecords: vi.fn(),
	},
}))

vi.mock('@/services/productionRecords', () => ({
	ProductionRecordsService: {
		getProductionRecords: vi.fn(),
	},
}))

vi.mock('@/services/species', () => ({
	SpeciesService: {
		getAllSpecies: vi.fn(),
	},
}))

vi.mock('@/services/tasks', () => ({
	TasksService: {
		getTasks: vi.fn(),
	},
}))

vi.mock('@/i18n', () => ({
	default: {
		t: vi.fn((key: string, options?: any) => {
			// Simple mock that returns the key or default value
			return options?.defaultValue || key
		}),
		language: 'eng',
	},
}))

describe('DashboardService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getDashboardQuickStats', () => {
		it('should return basic dashboard stats', async () => {
			const mockAnimals = [
				{ uuid: '1', status: true, healthStatus: 'healthy' },
				{ uuid: '2', status: true, healthStatus: 'healthy' },
				{ uuid: '3', status: false, healthStatus: 'sick', deathDate: '2024-01-01' }, // Dead animal
			]

			const mockTasks = [
				{ uuid: '1', status: 'todo' },
				{ uuid: '2', status: 'in-progress' },
				{ uuid: '3', status: 'done' },
			]

			const { AnimalsService } = await import('@/services/animals')
			const { TasksService } = await import('@/services/tasks')

			vi.mocked(AnimalsService.getAnimals).mockResolvedValue(mockAnimals as any)
			vi.mocked(TasksService.getTasks).mockResolvedValue(mockTasks as any)

			const result = await DashboardService.getDashboardQuickStats('farm-uuid')

			expect(result).toEqual({
				totalAnimals: 2, // Excludes dead animals
				healthyAnimals: 2, // Only animals with healthStatus: 'healthy'
				pendingTasks: 2, // todo + in-progress
				monthlyProduction: 0,
			})
		})

		it('should handle errors gracefully', async () => {
			const { AnimalsService } = await import('@/services/animals')
			vi.mocked(AnimalsService.getAnimals).mockRejectedValue(new Error('Database error'))

			const result = await DashboardService.getDashboardQuickStats('farm-uuid')

			expect(result).toEqual({
				totalAnimals: 0,
				healthyAnimals: 0,
				pendingTasks: 0,
				monthlyProduction: 0,
			})
		})

		it('should exclude dead animals from total count', async () => {
			const mockAnimals = [
				{ uuid: '1', status: true, healthStatus: 'healthy' },
				{ uuid: '2', status: true, healthStatus: 'sick', deathDate: '2024-01-01' },
				{ uuid: '3', status: true, healthStatus: 'healthy', soldDate: '2024-01-01' }, // Sold but alive
			]

			const mockTasks: any[] = []

			const { AnimalsService } = await import('@/services/animals')
			const { TasksService } = await import('@/services/tasks')

			vi.mocked(AnimalsService.getAnimals).mockResolvedValue(mockAnimals as any)
			vi.mocked(TasksService.getTasks).mockResolvedValue(mockTasks)

			const result = await DashboardService.getDashboardQuickStats('farm-uuid')

			expect(result).toEqual({
				totalAnimals: 2, // Excludes dead animal (uuid: '2')
				healthyAnimals: 1, // Only healthy animals that are not sold or dead
				pendingTasks: 0,
				monthlyProduction: 0,
			})
		})
	})

	describe('getAnimalDistribution', () => {
		it('should return animal distribution by species', async () => {
			const mockAnimals = [
				{ uuid: '1', speciesUuid: 'species-1' },
				{ uuid: '2', speciesUuid: 'species-1' },
				{ uuid: '3', speciesUuid: 'species-2' },
			]

			const mockSpecies = [
				{ uuid: 'species-1', name: 'Cattle' },
				{ uuid: 'species-2', name: 'Sheep' },
			]

			const { AnimalsService } = await import('@/services/animals')
			const { SpeciesService } = await import('@/services/species')

			vi.mocked(AnimalsService.getAnimals).mockResolvedValue(mockAnimals as any)
			vi.mocked(SpeciesService.getAllSpecies).mockResolvedValue(mockSpecies as any)

			const result = await DashboardService.getAnimalDistribution('farm-uuid')

			expect(result).toEqual([
				{ species: 'Cattle', count: 2 },
				{ species: 'Sheep', count: 1 },
			])
		})

		it('should handle unknown species', async () => {
			const mockAnimals = [{ uuid: '1', speciesUuid: 'unknown-species' }]

			const mockSpecies: any[] = []

			const { AnimalsService } = await import('@/services/animals')
			const { SpeciesService } = await import('@/services/species')

			vi.mocked(AnimalsService.getAnimals).mockResolvedValue(mockAnimals as any)
			vi.mocked(SpeciesService.getAllSpecies).mockResolvedValue(mockSpecies)

			const result = await DashboardService.getAnimalDistribution('farm-uuid')

			expect(result).toEqual([{ species: 'Unknown', count: 1 }])
		})
	})

	describe('getTasksOverview', () => {
		it('should return tasks overview by status', async () => {
			const mockTasks = [
				{ uuid: '1', status: 'todo' },
				{ uuid: '2', status: 'todo' },
				{ uuid: '3', status: 'in-progress' },
				{ uuid: '4', status: 'done' },
				{ uuid: '5', status: 'done' },
				{ uuid: '6', status: 'done' },
			]

			const { TasksService } = await import('@/services/tasks')
			vi.mocked(TasksService.getTasks).mockResolvedValue(mockTasks as any)

			const result = await DashboardService.getTasksOverview('farm-uuid')

			expect(result).toEqual({
				pending: 2,
				inProgress: 1,
				completed: 3,
			})
		})
	})

	describe('getHealthOverview', () => {
		it('should return health overview based on healthStatus field', async () => {
			const mockAnimals = [
				{ uuid: '1', healthStatus: 'healthy' },
				{ uuid: '2', healthStatus: 'healthy' },
				{ uuid: '3', healthStatus: 'sick' },
				{ uuid: '4', healthStatus: 'treatment' },
				{ uuid: '5', healthStatus: 'critical' },
				{ uuid: '6', healthStatus: 'unknown' },
				{ uuid: '7', healthStatus: 'healthy', soldDate: '2024-01-01' }, // Should be excluded
			]

			const { AnimalsService } = await import('@/services/animals')
			vi.mocked(AnimalsService.getAnimals).mockResolvedValue(mockAnimals as any)

			const result = await DashboardService.getHealthOverview('farm-uuid')

			expect(result).toEqual({
				healthy: 2, // Only active healthy animals
				sick: 2, // sick + critical
				inTreatment: 1,
				checkupDue: 1, // unknown status
			})
		})

		it('should exclude sold and dead animals from health overview', async () => {
			const mockAnimals = [
				{ uuid: '1', healthStatus: 'healthy' },
				{ uuid: '2', healthStatus: 'healthy', soldDate: '2024-01-01' },
				{ uuid: '3', healthStatus: 'sick', deathDate: '2024-01-01' },
			]

			const { AnimalsService } = await import('@/services/animals')
			vi.mocked(AnimalsService.getAnimals).mockResolvedValue(mockAnimals as any)

			const result = await DashboardService.getHealthOverview('farm-uuid')

			expect(result).toEqual({
				healthy: 1, // Only the active healthy animal
				sick: 0,
				inTreatment: 0,
				checkupDue: 0,
			})
		})
	})
})
