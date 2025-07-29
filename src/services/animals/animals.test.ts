import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AnimalsService } from '@/services/animals'

import { createMockAnimal } from '@/tests/utils/test-utils'

// Mock Firebase
vi.mock('firebase/firestore', () => ({
	collection: vi.fn(),
	doc: vi.fn(),
	getDoc: vi.fn(),
	getDocs: vi.fn(),
	query: vi.fn(),
	setDoc: vi.fn(),
	where: vi.fn(),
}))

// Mock firestore config
vi.mock('@/config/firebaseConfig', () => ({
	firestore: {},
}))

// Mock storage handler
vi.mock('@/config/persistence/storageHandler', () => ({
	default: {
		setPicture: vi.fn(),
		getPicture: vi.fn(),
	},
}))

// Mock dayjs
vi.mock('dayjs', () => ({
	default: vi.fn(() => ({
		toISOString: () => '2024-01-15T10:00:00.000Z',
	})),
}))

describe('AnimalsService', () => {
	const mockFarmUuid = 'test-farm-uuid'
	const mockAnimalUuid = 'test-animal-uuid'
	const mockCreatedBy = 'test-user-uuid'

	let mockGetDocs: any
	let mockGetDoc: any
	let mockSetDoc: any
	let mockDoc: any
	let mockCollection: any
	let mockQuery: any
	let mockWhere: any
	let mockSetPicture: any
	let mockGetPicture: any

	beforeEach(async () => {
		vi.clearAllMocks()

		// Get mock references from firebase/firestore
		const firestore = await import('firebase/firestore')
		mockGetDocs = vi.mocked(firestore.getDocs)
		mockGetDoc = vi.mocked(firestore.getDoc)
		mockSetDoc = vi.mocked(firestore.setDoc)
		mockDoc = vi.mocked(firestore.doc)
		mockCollection = vi.mocked(firestore.collection)
		mockQuery = vi.mocked(firestore.query)
		mockWhere = vi.mocked(firestore.where)

		// Get storage handler mock references
		const { default: storageHandler } = await import('@/config/persistence/storageHandler')
		mockSetPicture = vi.mocked(storageHandler.setPicture)
		mockGetPicture = vi.mocked(storageHandler.getPicture)

		mockQuery.mockReturnValue('mock-query')
		mockCollection.mockReturnValue('mock-collection')
		mockWhere.mockReturnValue('mock-where')
		mockDoc.mockReturnValue('mock-doc-ref')
	})

	describe('getAnimals', () => {
		it('should fetch animals for a farm', async () => {
			const mockAnimals = [
				createMockAnimal({ animalId: '002' }),
				createMockAnimal({ animalId: '001' }),
			]

			const mockDocs = mockAnimals.map((animal) => ({
				data: () => animal,
			}))

			mockGetDocs.mockResolvedValue({ docs: mockDocs })

			const result = await AnimalsService.getAnimals(mockFarmUuid)

			expect(mockCollection).toHaveBeenCalledWith({}, 'animals')
			expect(mockWhere).toHaveBeenCalledWith('status', '==', true)
			expect(mockWhere).toHaveBeenCalledWith('farmUuid', '==', mockFarmUuid)
			expect(mockQuery).toHaveBeenCalled()
			expect(mockGetDocs).toHaveBeenCalledWith('mock-query')

			// Should be sorted by animalId descending
			expect(result).toHaveLength(2)
			expect(result[0].animalId).toBe('002')
			expect(result[1].animalId).toBe('001')
		})

		it('should handle empty results', async () => {
			mockGetDocs.mockResolvedValue({ docs: [] })

			const result = await AnimalsService.getAnimals(mockFarmUuid)

			expect(result).toEqual([])
		})

		it('should handle null farmUuid', async () => {
			mockGetDocs.mockResolvedValue({ docs: [] })

			const result = await AnimalsService.getAnimals(null)

			expect(mockWhere).toHaveBeenCalledWith('farmUuid', '==', null)
			expect(result).toEqual([])
		})

		it('should sort animals correctly by animalId', async () => {
			const mockAnimals = [
				createMockAnimal({ animalId: '005' }),
				createMockAnimal({ animalId: '001' }),
				createMockAnimal({ animalId: '010' }),
				createMockAnimal({ animalId: '003' }),
			]

			const mockDocs = mockAnimals.map((animal) => ({
				data: () => animal,
			}))

			mockGetDocs.mockResolvedValue({ docs: mockDocs })

			const result = await AnimalsService.getAnimals(mockFarmUuid)

			// Should be sorted by animalId descending (as numbers)
			expect(result.map((a) => a.animalId)).toEqual(['010', '005', '003', '001'])
		})
	})

	describe('getAnimal', () => {
		it('should fetch a single animal by UUID', async () => {
			const mockAnimal = createMockAnimal()

			mockGetDoc.mockResolvedValue({
				data: () => mockAnimal,
			})

			const result = await AnimalsService.getAnimal(mockAnimalUuid)

			expect(mockDoc).toHaveBeenCalledWith({}, 'animals', mockAnimalUuid)
			expect(mockGetDoc).toHaveBeenCalledWith('mock-doc-ref')
			expect(result).toEqual(mockAnimal)
		})

		it('should handle non-existent animal', async () => {
			mockGetDoc.mockResolvedValue({
				data: () => undefined,
			})

			const result = await AnimalsService.getAnimal(mockAnimalUuid)

			expect(result).toBeUndefined()
		})
	})

	describe('getAnimalsBySpecies', () => {
		it('should fetch animals by species', async () => {
			const mockSpeciesUuid = 'test-species-uuid'
			const mockAnimals = [createMockAnimal({ speciesUuid: mockSpeciesUuid })]

			const mockDocs = mockAnimals.map((animal) => ({
				data: () => animal,
			}))

			mockGetDocs.mockResolvedValue({ docs: mockDocs })

			const result = await AnimalsService.getAnimalsBySpecies(mockSpeciesUuid, mockFarmUuid)

			expect(mockWhere).toHaveBeenCalledWith('status', '==', true)
			expect(mockWhere).toHaveBeenCalledWith('speciesUuid', '==', mockSpeciesUuid)
			expect(mockWhere).toHaveBeenCalledWith('farmUuid', '==', mockFarmUuid)
			expect(result).toEqual(mockAnimals)
		})

		it('should handle empty species results', async () => {
			mockGetDocs.mockResolvedValue({ docs: [] })

			const result = await AnimalsService.getAnimalsBySpecies('non-existent', mockFarmUuid)

			expect(result).toEqual([])
		})
	})

	describe('setAnimal', () => {
		it('should create a new animal without picture', async () => {
			const mockAnimal = createMockAnimal({ picture: '' })

			await AnimalsService.setAnimal(mockAnimal, mockCreatedBy, mockFarmUuid)

			expect(mockDoc).toHaveBeenCalledWith({}, 'animals', mockAnimal.uuid)
			expect(mockSetDoc).toHaveBeenCalledWith(
				'mock-doc-ref',
				{
					...mockAnimal,
					createdAt: '2024-01-15T10:00:00.000Z',
					createdBy: mockCreatedBy,
					farmUuid: mockFarmUuid,
				},
				{ merge: true }
			)
		})

		it('should create a new animal with picture upload', async () => {
			const mockAnimal = createMockAnimal({ picture: 'data:image/jpeg;base64,/9j/4AAQ...' })
			const mockUploadedPicture = 'https://firebasestorage.googleapis.com/uploaded-image.jpg'

			mockSetPicture.mockResolvedValue({
				metadata: { fullPath: 'animals/test-animal-id/image.jpg' },
			})
			mockGetPicture.mockResolvedValue(mockUploadedPicture)

			await AnimalsService.setAnimal(mockAnimal, mockCreatedBy, mockFarmUuid)

			expect(mockSetPicture).toHaveBeenCalledWith(
				`animals/${mockAnimal.uuid}`,
				'data:image/jpeg;base64,/9j/4AAQ...'
			)
			expect(mockGetPicture).toHaveBeenCalledWith('animals/test-animal-id/image.jpg')
			expect(mockSetDoc).toHaveBeenCalledWith(
				'mock-doc-ref',
				{
					...mockAnimal,
					picture: mockUploadedPicture,
					createdAt: '2024-01-15T10:00:00.000Z',
					createdBy: mockCreatedBy,
					farmUuid: mockFarmUuid,
				},
				{ merge: true }
			)
		})

		it('should not upload picture if already from Firebase storage', async () => {
			const mockAnimal = createMockAnimal({
				picture: 'https://firebasestorage.googleapis.com/existing-image.jpg',
			})

			await AnimalsService.setAnimal(mockAnimal, mockCreatedBy, mockFarmUuid)

			expect(mockSetPicture).not.toHaveBeenCalled()
			expect(mockGetPicture).not.toHaveBeenCalled()
			expect(mockSetDoc).toHaveBeenCalledWith(
				'mock-doc-ref',
				expect.objectContaining({
					picture: 'https://firebasestorage.googleapis.com/existing-image.jpg',
				}),
				{ merge: true }
			)
		})

		it('should handle picture upload failure', async () => {
			const mockAnimal = createMockAnimal({ picture: 'data:image/jpeg;base64,/9j/4AAQ...' })

			mockSetPicture.mockRejectedValue(new Error('Upload failed'))

			await expect(
				AnimalsService.setAnimal(mockAnimal, mockCreatedBy, mockFarmUuid)
			).rejects.toThrow('Upload failed')

			expect(mockSetDoc).not.toHaveBeenCalled()
		})

		it('should handle different picture formats', async () => {
			const testCases = [
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
				'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
				'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
			]

			for (const picture of testCases) {
				const mockAnimal = createMockAnimal({ picture })
				mockSetPicture.mockResolvedValue({
					metadata: { fullPath: 'animals/test/image' },
				})
				mockGetPicture.mockResolvedValue('https://firebasestorage.googleapis.com/image.jpg')

				await AnimalsService.setAnimal(mockAnimal, mockCreatedBy, mockFarmUuid)

				expect(mockSetPicture).toHaveBeenCalledWith(`animals/${mockAnimal.uuid}`, picture)
			}
		})
	})

	describe('updateAnimal', () => {
		it('should update an existing animal', async () => {
			const mockAnimal = createMockAnimal()
			const mockEditedBy = 'editor-uuid'

			await AnimalsService.updateAnimal(mockAnimal, mockEditedBy)

			expect(mockSetDoc).toHaveBeenCalledWith(
				'mock-doc-ref',
				{
					...mockAnimal,
					updateAt: '2024-01-15T10:00:00.000Z',
					editedBy: mockEditedBy,
				},
				{ merge: true }
			)
		})

		it('should update animal with new picture upload', async () => {
			const mockAnimal = createMockAnimal({ picture: 'data:image/jpeg;base64,/9j/4AAQ...' })
			const mockUploadedPicture = 'https://firebasestorage.googleapis.com/updated-image.jpg'

			mockSetPicture.mockResolvedValue({
				metadata: { fullPath: 'animals/test-uuid/image.jpg' },
			})
			mockGetPicture.mockResolvedValue(mockUploadedPicture)

			await AnimalsService.updateAnimal(mockAnimal, 'editor-uuid')

			expect(mockSetPicture).toHaveBeenCalled()
			expect(mockSetDoc).toHaveBeenCalledWith(
				'mock-doc-ref',
				expect.objectContaining({
					picture: mockUploadedPicture,
				}),
				{ merge: true }
			)
		})

		it('should handle null editedBy', async () => {
			const mockAnimal = createMockAnimal()

			await AnimalsService.updateAnimal(mockAnimal, null)

			expect(mockSetDoc).toHaveBeenCalledWith(
				'mock-doc-ref',
				expect.objectContaining({
					editedBy: null,
				}),
				{ merge: true }
			)
		})
	})

	describe('deleteAnimal', () => {
		it('should soft delete an animal by setting status to false', async () => {
			await AnimalsService.deleteAnimal(mockAnimalUuid, false)

			expect(mockDoc).toHaveBeenCalledWith({}, 'animals', mockAnimalUuid)
			expect(mockSetDoc).toHaveBeenCalledWith(
				'mock-doc-ref',
				{
					status: false,
					updateAt: '2024-01-15T10:00:00.000Z',
				},
				{ merge: true }
			)
		})

		it('should restore an animal by setting status to true', async () => {
			await AnimalsService.deleteAnimal(mockAnimalUuid, true)

			expect(mockSetDoc).toHaveBeenCalledWith(
				'mock-doc-ref',
				{
					status: true,
					updateAt: '2024-01-15T10:00:00.000Z',
				},
				{ merge: true }
			)
		})
	})

	describe('error handling', () => {
		it('should handle Firestore errors in getAnimals', async () => {
			mockGetDocs.mockRejectedValue(new Error('Firestore error'))

			await expect(AnimalsService.getAnimals(mockFarmUuid)).rejects.toThrow('Firestore error')
		})

		it('should handle Firestore errors in setAnimal', async () => {
			const mockAnimal = createMockAnimal()
			mockSetDoc.mockRejectedValue(new Error('Write failed'))

			await expect(
				AnimalsService.setAnimal(mockAnimal, mockCreatedBy, mockFarmUuid)
			).rejects.toThrow('Write failed')
		})

		it('should handle storage errors during picture upload', async () => {
			const mockAnimal = createMockAnimal({ picture: 'data:image/jpeg;base64,test' })
			mockSetPicture.mockRejectedValue(new Error('Storage error'))

			await expect(
				AnimalsService.setAnimal(mockAnimal, mockCreatedBy, mockFarmUuid)
			).rejects.toThrow('Storage error')
		})
	})

	describe('edge cases', () => {
		it('should handle animals with special characters in animalId', async () => {
			const mockAnimals = [
				createMockAnimal({ animalId: 'A-001' }),
				createMockAnimal({ animalId: 'B_002' }),
				createMockAnimal({ animalId: 'C.003' }),
			]

			const mockDocs = mockAnimals.map((animal) => ({
				data: () => animal,
			}))

			mockGetDocs.mockResolvedValue({ docs: mockDocs })

			const result = await AnimalsService.getAnimals(mockFarmUuid)

			expect(result).toHaveLength(3)
			expect(result.map((a) => a.animalId)).toContain('A-001')
			expect(result.map((a) => a.animalId)).toContain('B_002')
			expect(result.map((a) => a.animalId)).toContain('C.003')
		})

		it('should handle very large datasets', async () => {
			const mockAnimals = Array.from({ length: 1000 }, (_, i) =>
				createMockAnimal({ animalId: i.toString().padStart(4, '0') })
			)

			const mockDocs = mockAnimals.map((animal) => ({
				data: () => animal,
			}))

			mockGetDocs.mockResolvedValue({ docs: mockDocs })

			const result = await AnimalsService.getAnimals(mockFarmUuid)

			expect(result).toHaveLength(1000)
			expect(result[0].animalId).toBe('0999') // Should be sorted descending
		})
	})
})
