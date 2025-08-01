import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SpeciesService } from './index'

vi.mock('@/config/firebaseConfig', () => ({
	firestore: {},
}))

vi.mock('firebase/firestore', () => ({
	collection: vi.fn(),
	doc: vi.fn(),
	getDocs: vi.fn(),
	query: vi.fn(),
	where: vi.fn(),
	setDoc: vi.fn(),
	deleteDoc: vi.fn(),
}))

describe('SpeciesService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getAllSpecies', () => {
		it('should return all species for a farm', async () => {
			const mockSpecies = [
				{
					uuid: '1',
					name: 'Cattle',
					farmUuid: 'farm-1',
				},
				{
					uuid: '2',
					name: 'Sheep',
					farmUuid: 'farm-1',
				},
			]

			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: mockSpecies.map((species) => ({
					data: () => species,
				})),
			} as any)

			const result = await SpeciesService.getAllSpecies('farm-1')

			expect(result).toHaveLength(2)
			expect(result[0].name).toBe('Cattle')
			expect(result[1].name).toBe('Sheep')
		})

		it('should return empty array when no species found', async () => {
			const { getDocs } = await import('firebase/firestore')
			vi.mocked(getDocs).mockResolvedValue({
				docs: [],
			} as any)

			const result = await SpeciesService.getAllSpecies('farm-1')

			expect(result).toHaveLength(0)
		})
	})

	describe('upsertSpecies', () => {
		it('should create or update a species', async () => {
			const mockSpecies = {
				uuid: '1',
				name: 'Cattle',
				farmUuid: 'farm-1',
			}

			const { setDoc } = await import('firebase/firestore')
			vi.mocked(setDoc).mockResolvedValue(undefined)

			await SpeciesService.upsertSpecies(mockSpecies as any)

			expect(setDoc).toHaveBeenCalled()
		})
	})

	describe('deleteSpecies', () => {
		it('should delete a species', async () => {
			const { deleteDoc } = await import('firebase/firestore')
			vi.mocked(deleteDoc).mockResolvedValue(undefined)

			await SpeciesService.deleteSpecies('species-1')

			expect(deleteDoc).toHaveBeenCalled()
		})
	})
})
