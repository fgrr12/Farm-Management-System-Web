import { vi } from 'vitest'

export const mockUserStore = {
	useUserStore: () => ({
		user: { name: 'Test User', uuid: 'user-123' },
	}),
}

export const mockFarmStore = {
	useFarmStore: () => ({
		farm: {
			uuid: 'farm-123',
			species: [
				{ uuid: 'species-1', name: 'Vaca' },
				{ uuid: 'species-2', name: 'Cerdo' },
			],
		},
	}),
}

export const mockAppStore = {
	useAppStore: () => ({
		defaultModalData: {},
		setLoading: vi.fn(),
		setModalData: vi.fn(),
		setHeaderTitle: vi.fn(),
	}),
}
