import { vi } from 'vitest'

// Mock App Store
const mockAppStoreData = {
	headerTitle: 'Test App',
	isLoading: false,
	error: null,
	setHeaderTitle: vi.fn(),
	setLoading: vi.fn(),
	setError: vi.fn(),
	clearError: vi.fn(),
}

export const mockAppStore = {
	useAppStore: () => mockAppStoreData,
}

// Mock User Store
const mockUserStoreData = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
	setUser: vi.fn(),
	clearUser: vi.fn(),
	setLoading: vi.fn(),
	setError: vi.fn(),
	clearError: vi.fn(),
}

export const mockUserStore = {
	useUserStore: () => mockUserStoreData,
}

// Mock Farm Store
const mockFarmStoreData = {
	farm: null,
	animals: [],
	employees: [],
	tasks: [],
	species: [],
	breeds: [],
	isLoading: false,
	error: null,
	setFarm: vi.fn(),
	setAnimals: vi.fn(),
	addAnimal: vi.fn(),
	updateAnimal: vi.fn(),
	removeAnimal: vi.fn(),
	setEmployees: vi.fn(),
	addEmployee: vi.fn(),
	updateEmployee: vi.fn(),
	removeEmployee: vi.fn(),
	setTasks: vi.fn(),
	addTask: vi.fn(),
	updateTask: vi.fn(),
	removeTask: vi.fn(),
	setSpecies: vi.fn(),
	addSpecies: vi.fn(),
	updateSpecies: vi.fn(),
	removeSpecies: vi.fn(),
	setBreeds: vi.fn(),
	addBreed: vi.fn(),
	updateBreed: vi.fn(),
	removeBreed: vi.fn(),
	setLoading: vi.fn(),
	setError: vi.fn(),
	clearError: vi.fn(),
	reset: vi.fn(),
}

export const mockFarmStore = {
	useFarmStore: () => mockFarmStoreData,
}
