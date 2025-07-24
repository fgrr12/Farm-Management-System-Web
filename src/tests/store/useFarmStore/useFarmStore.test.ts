import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useFarmStore } from '@/store/useFarmStore'

import { createMockFarm } from '@/tests/utils/test-utils'

// Mock services
vi.mock('@/services/farms', () => ({
	FarmsService: {
		getFarm: vi.fn(),
	},
}))

vi.mock('@/services/billingCards', () => ({
	BillingCardsService: {
		getBillingCardByUuid: vi.fn(),
	},
}))

vi.mock('@/services/species', () => ({
	SpeciesService: {
		getAllSpecies: vi.fn().mockResolvedValue([
			{ uuid: 'species-1', name: 'Cattle' },
			{ uuid: 'species-2', name: 'Sheep' },
		]),
	},
}))

vi.mock('@/services/breeds', () => ({
	BreedsService: {
		getAllBreeds: vi.fn().mockResolvedValue([
			{ uuid: 'breed-1', name: 'Holstein' },
			{ uuid: 'breed-2', name: 'Jersey' },
		]),
	},
}))

// Mock sessionStorage
const mockSessionStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
	value: mockSessionStorage,
})

describe('useFarmStore', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockSessionStorage.getItem.mockReturnValue(null)

		// Reset store state
		useFarmStore.setState({
			farm: null,
			billingCard: null,
			species: [],
			breeds: [],
		})
	})

	it('should initialize with empty state', () => {
		const { result } = renderHook(() => useFarmStore())

		expect(result.current.farm).toBeNull()
		expect(result.current.billingCard).toBeNull()
		expect(result.current.species).toEqual([])
		expect(result.current.breeds).toEqual([])
	})

	it('should set farm correctly', () => {
		const { result } = renderHook(() => useFarmStore())
		const mockFarm = createMockFarm()

		act(() => {
			result.current.setFarm(mockFarm)
		})

		expect(result.current.farm).toEqual(mockFarm)
	})

	it('should set species correctly', () => {
		const { result } = renderHook(() => useFarmStore())
		const mockSpecies = [
			{ uuid: 'species-1', farmUuid: 'test-farm', name: 'Cattle' },
			{ uuid: 'species-2', farmUuid: 'test-farm', name: 'Sheep' },
		]

		act(() => {
			result.current.setSpecies(mockSpecies)
		})

		expect(result.current.species).toEqual(mockSpecies)
	})

	it('should set breeds correctly', () => {
		const { result } = renderHook(() => useFarmStore())
		const mockBreeds = [
			{
				uuid: 'breed-1',
				farmUuid: 'test-farm',
				speciesUuid: 'species-1',
				name: 'Holstein',
				gestationPeriod: 280,
			},
			{
				uuid: 'breed-2',
				farmUuid: 'test-farm',
				speciesUuid: 'species-1',
				name: 'Jersey',
				gestationPeriod: 280,
			},
		]

		act(() => {
			result.current.setBreeds(mockBreeds)
		})

		expect(result.current.breeds).toEqual(mockBreeds)
	})

	it('should load farm data correctly', async () => {
		const mockFarm = createMockFarm()
		const mockBillingCard = {
			uuid: 'billing-1',
			id: 'card-1',
			name: 'Test Card',
			phone: '123-456-7890',
			email: 'test@example.com',
			address: '123 Test St',
			status: true,
		}

		// Mock service responses using dynamic imports
		const farmsService = await import('@/services/farms')
		const billingCardsService = await import('@/services/billingCards')

		vi.mocked(farmsService.FarmsService.getFarm).mockResolvedValue(mockFarm)
		vi.mocked(billingCardsService.BillingCardsService.getBillingCardByUuid).mockResolvedValue(
			mockBillingCard
		)

		const { result } = renderHook(() => useFarmStore())

		await act(async () => {
			await result.current.loadFarmData('farm-uuid', 'owner')
		})

		expect(result.current.farm).toEqual(mockFarm)
		expect(result.current.billingCard).toEqual(mockBillingCard)
		expect(result.current.species).toHaveLength(2)
		expect(result.current.breeds).toHaveLength(2)
	})

	it('should not load billing card for employee role', async () => {
		const mockFarm = createMockFarm()

		// Mock service responses using dynamic imports
		const farmsService = await import('@/services/farms')
		vi.mocked(farmsService.FarmsService.getFarm).mockResolvedValue(mockFarm)

		const { result } = renderHook(() => useFarmStore())

		await act(async () => {
			await result.current.loadFarmData('farm-uuid', 'employee')
		})

		expect(result.current.farm).toEqual(mockFarm)
		expect(result.current.billingCard).toBeNull()
	})
})
