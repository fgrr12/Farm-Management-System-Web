import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProductionRecordsService } from './index'

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

describe('ProductionRecordsService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getProductionRecords', () => {
		it('should return production records for an animal', async () => {
			const mockProductionRecords = [
				{
					uuid: '1',
					animalUuid: 'animal-1',
					date: '2024-01-01',
					quantity: 25.5,
					notes: 'Good production',
					status: true,
				},
				{
					uuid: '2',
					animalUuid: 'animal-1',
					date: '2024-01-02',
					quantity: 28.0,
					notes: 'Excellent production',
					status: true,
				},
			]

			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: mockProductionRecords.map((record) => ({
					data: () => record,
					id: record.uuid,
				})),
			} as any)

			const result = await ProductionRecordsService.getProductionRecords('animal-1')

			expect(result).toHaveLength(2)
			expect(result[0].quantity).toBe(28.0)
			expect(result[1].quantity).toBe(25.5)
		})

		it('should apply limit when specified', async () => {
			const mockProductionRecords = Array.from({ length: 10 }, (_, i) => ({
				uuid: `${i + 1}`,
				animalUuid: 'animal-1',
				date: `2024-01-${String(i + 1).padStart(2, '0')}`,
				quantity: 25 + i,
				notes: `Production ${i + 1}`,
				status: true,
			}))

			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: mockProductionRecords.map((record) => ({
					data: () => record,
					id: record.uuid,
				})),
			} as any)

			const result = await ProductionRecordsService.getProductionRecords('animal-1', 3)

			expect(result).toHaveLength(3)
		})
	})

	describe('getProductionRecord', () => {
		it('should return a single production record', async () => {
			const mockProductionRecord = {
				uuid: '1',
				animalUuid: 'animal-1',
				date: '2024-01-01',
				quantity: 25.5,
				notes: 'Good production',
				status: true,
			}

			const { getDoc } = await import('firebase/firestore')
			vi.mocked(getDoc).mockResolvedValue({
				data: () => mockProductionRecord,
			} as any)

			const result = await ProductionRecordsService.getProductionRecord('1')

			expect(result).toEqual(mockProductionRecord)
		})
	})

	describe('setProductionRecord', () => {
		it('should create a production record', async () => {
			const mockProductionRecord = {
				uuid: '1',
				animalUuid: 'animal-1',
				date: '2024-01-01',
				quantity: 25.5,
				notes: 'Good production',
				status: true,
			}

			const { setDoc } = await import('firebase/firestore')
			vi.mocked(setDoc).mockResolvedValue(undefined)

			await ProductionRecordsService.setProductionRecord(mockProductionRecord, 'user-1')

			expect(setDoc).toHaveBeenCalled()
		})
	})

	describe('updateProductionRecord', () => {
		it('should update a production record', async () => {
			const mockProductionRecord = {
				uuid: '1',
				animalUuid: 'animal-1',
				date: '2024-01-01',
				quantity: 30.0,
				notes: 'Updated production',
				status: true,
			}

			const { setDoc } = await import('firebase/firestore')
			vi.mocked(setDoc).mockResolvedValue(undefined)

			await ProductionRecordsService.updateProductionRecord(mockProductionRecord, 'user-1')

			expect(setDoc).toHaveBeenCalled()
		})
	})

	describe('updateProductionRecordsStatus', () => {
		it('should update production record status', async () => {
			const { setDoc } = await import('firebase/firestore')
			vi.mocked(setDoc).mockResolvedValue(undefined)

			await ProductionRecordsService.updateProductionRecordsStatus('1', false)

			expect(setDoc).toHaveBeenCalled()
		})
	})
})
