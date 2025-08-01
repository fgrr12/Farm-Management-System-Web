import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AnimalsService } from './index'

// Mock Firebase
vi.mock('@/config/firebaseConfig', () => ({
	firestore: {},
}))

// Mock Firebase functions
vi.mock('firebase/firestore', () => ({
	collection: vi.fn(),
	query: vi.fn(),
	where: vi.fn(),
	getDocs: vi.fn(),
	doc: vi.fn(),
	getDoc: vi.fn(),
	setDoc: vi.fn(),
}))

// Mock storage handler
vi.mock('@/config/persistence/storageHandler', () => ({
	default: {
		setPicture: vi.fn(),
		getPicture: vi.fn(),
	},
}))

// Mock health status updater
vi.mock('@/utils/healthStatusUpdater', () => ({
	calculateHealthStatusFromRecords: vi.fn(),
	getLastHealthCheckDate: vi.fn(),
}))

describe('AnimalsService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getAnimals', () => {
		it('should sort animals by health status priority and then by animalId', async () => {
			const mockAnimals = [
				{ animalId: '001', healthStatus: 'healthy' },
				{ animalId: '002', healthStatus: 'critical' },
				{ animalId: '003', healthStatus: 'sick' },
				{ animalId: '004', healthStatus: 'treatment' },
				{ animalId: '005', healthStatus: 'unknown' },
				{ animalId: '006', healthStatus: 'healthy' },
			]

			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: mockAnimals.map((animal) => ({
					data: () => animal,
				})),
			} as any)

			const result = await AnimalsService.getAnimals('farm-uuid')

			// Should be sorted by health status priority first
			expect(result[0].healthStatus).toBe('critical') // Priority 1
			expect(result[1].healthStatus).toBe('sick') // Priority 2
			expect(result[2].healthStatus).toBe('treatment') // Priority 3
			expect(result[3].healthStatus).toBe('unknown') // Priority 4
			expect(result[4].healthStatus).toBe('healthy') // Priority 5
			expect(result[5].healthStatus).toBe('healthy') // Priority 5

			// Within same health status, should be sorted by animalId descending
			const healthyAnimals = result.filter((animal) => animal.healthStatus === 'healthy')
			expect(healthyAnimals[0].animalId).toBe('006') // Higher animalId first
			expect(healthyAnimals[1].animalId).toBe('001')
		})

		it('should handle animals with undefined healthStatus', async () => {
			const mockAnimals = [
				{ animalId: '001', healthStatus: 'healthy' },
				{ animalId: '002' }, // No healthStatus
				{ animalId: '003', healthStatus: 'sick' },
			]

			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: mockAnimals.map((animal) => ({
					data: () => animal,
				})),
			} as any)

			const result = await AnimalsService.getAnimals('farm-uuid')

			// Sick should come first (priority 2)
			expect(result[0].healthStatus).toBe('sick')
			// Animals with undefined healthStatus get priority 6, so they come after healthy (priority 5)
			// So the order should be: sick, healthy, undefined
			expect(result[1].healthStatus).toBe('healthy')
			expect(result[2].healthStatus).toBeUndefined()
		})

		it('should sort by animalId when health status is the same', async () => {
			const mockAnimals = [
				{ animalId: '001', healthStatus: 'healthy' },
				{ animalId: '005', healthStatus: 'healthy' },
				{ animalId: '003', healthStatus: 'healthy' },
			]

			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: mockAnimals.map((animal) => ({
					data: () => animal,
				})),
			} as any)

			const result = await AnimalsService.getAnimals('farm-uuid')

			// Should be sorted by animalId descending
			expect(result[0].animalId).toBe('005')
			expect(result[1].animalId).toBe('003')
			expect(result[2].animalId).toBe('001')
		})
	})
})
