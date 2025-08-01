import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HealthRecordsService } from './index'

vi.mock('@/config/firebaseConfig', () => ({
	firestore: {},
}))

vi.mock('firebase/firestore', () => ({
	collection: vi.fn(),
	doc: vi.fn(),
	getDoc: vi.fn(),
	getDocs: vi.fn(),
	query: vi.fn(),
	where: vi.fn(),
	setDoc: vi.fn(),
}))

vi.mock('@/utils/formatDate', () => ({
	formatDate: vi.fn((date) => date),
}))

vi.mock('@/services/breeds', () => ({
	BreedsService: {
		getBreed: vi.fn(),
	},
}))

vi.mock('@/services/animals', () => ({
	AnimalsService: {
		getAnimal: vi.fn(),
	},
}))

describe('HealthRecordsService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getHealthRecords', () => {
		it('should return health records for an animal', async () => {
			const mockHealthRecords = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					type: 'Checkup',
					reason: 'Routine checkup',
					date: '2024-01-01',
					status: true,
				},
				{
					uuid: '2',
					animalUuid: 'animal-1',
					type: 'Vaccination',
					reason: 'Annual vaccination',
					date: '2024-01-02',
					status: true,
				},
			]

			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: mockHealthRecords.map((record) => ({
					data: () => record,
				})),
			} as any)

			const result = await HealthRecordsService.getHealthRecords('animal-1')

			expect(result).toHaveLength(2)
			expect(result[0].type).toBe('Vaccination')
			expect(result[1].type).toBe('Checkup')
		})

		it('should apply limit when specified', async () => {
			const mockHealthRecords = Array.from({ length: 10 }, (_, i) => ({
				uuid: `${i + 1}`,
				animalUuid: 'animal-1',
				type: 'Checkup',
				reason: 'Routine checkup',
				date: `2024-01-${String(i + 1).padStart(2, '0')}`,
				status: true,
			}))

			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: mockHealthRecords.map((record) => ({
					data: () => record,
				})),
			} as any)

			const result = await HealthRecordsService.getHealthRecords('animal-1', 5)

			expect(result).toHaveLength(5)
		})
	})

	describe('getHealthRecord', () => {
		it('should return a single health record', async () => {
			const mockHealthRecord = {
				uuid: '1',
				animalUuid: 'animal-1',
				type: 'Checkup',
				reason: 'Routine checkup',
				date: '2024-01-01',
				status: true,
			}

			const { getDoc } = await import('firebase/firestore')
			vi.mocked(getDoc).mockResolvedValue({
				data: () => mockHealthRecord,
			} as any)

			const result = await HealthRecordsService.getHealthRecord('1')

			expect(result).toEqual(mockHealthRecord)
		})
	})

	describe('setHealthRecord', () => {
		it('should create a health record', async () => {
			const mockHealthRecord = {
				uuid: '1',
				animalUuid: 'animal-1',
				type: 'Checkup' as const,
				reason: 'Routine checkup',
				notes: 'All good',
				date: '2024-01-01',
				status: true,
				reviewedBy: 'vet-1',
				createdBy: 'user-1',
			}

			const { setDoc } = await import('firebase/firestore')
			vi.mocked(setDoc).mockResolvedValue(undefined)

			await HealthRecordsService.setHealthRecord(mockHealthRecord, 'user-1')

			expect(setDoc).toHaveBeenCalled()
		})

		it('should handle pregnancy type and create birth record', async () => {
			const mockHealthRecord = {
				uuid: '1',
				animalUuid: 'animal-1',
				type: 'Pregnancy' as const,
				reason: 'Confirmed pregnancy',
				notes: 'Due in 9 months',
				date: '2024-01-01',
				status: true,
				reviewedBy: 'vet-1',
				createdBy: 'user-1',
			}

			const mockAnimal = {
				uuid: 'animal-1',
				breedUuid: 'breed-1',
			}

			const mockBreed = {
				uuid: 'breed-1',
				gestationPeriod: 280,
			}

			const { AnimalsService } = await import('@/services/animals')
			const { BreedsService } = await import('@/services/breeds')
			const { setDoc } = await import('firebase/firestore')

			vi.mocked(AnimalsService.getAnimal).mockResolvedValue(mockAnimal as any)
			vi.mocked(BreedsService.getBreed).mockResolvedValue(mockBreed as any)
			vi.mocked(setDoc).mockResolvedValue(undefined)

			await HealthRecordsService.setHealthRecord(mockHealthRecord, 'user-1')

			expect(setDoc).toHaveBeenCalledTimes(3)
		})
	})

	describe('updateHealthRecord', () => {
		it('should update a health record', async () => {
			const mockHealthRecord = {
				uuid: '1',
				animalUuid: 'animal-1',
				type: 'Checkup' as const,
				reason: 'Updated checkup',
				notes: 'Updated notes',
				date: '2024-01-01',
				status: true,
				reviewedBy: 'vet-1',
				createdBy: 'user-1',
			}

			const { setDoc } = await import('firebase/firestore')
			vi.mocked(setDoc).mockResolvedValue(undefined)

			await HealthRecordsService.updateHealthRecord(mockHealthRecord, 'user-1')

			expect(setDoc).toHaveBeenCalled()
		})
	})

	describe('updateHealthRecordsStatus', () => {
		it('should update health record status', async () => {
			const { setDoc } = await import('firebase/firestore')
			vi.mocked(setDoc).mockResolvedValue(undefined)

			await HealthRecordsService.updateHealthRecordsStatus('1', false)

			expect(setDoc).toHaveBeenCalled()
		})
	})
})
