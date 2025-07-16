import { vi } from 'vitest'

// Mock animal services
export const mockAnimalService = {
	getAnimals: vi.fn(),
	getAnimalById: vi.fn(),
	createAnimal: vi.fn(),
	updateAnimal: vi.fn(),
	deleteAnimal: vi.fn(),
	uploadAnimalImage: vi.fn(),
}

// Mock animals service (for AnimalsService)
export const mockAnimalsService = {
	AnimalsService: {
		getAnimals: vi.fn(),
		getAnimal: vi.fn(),
		getAnimalsBySpecies: vi.fn(),
		setAnimal: vi.fn(),
		updateAnimal: vi.fn(),
		deleteAnimal: vi.fn(),
	},
}

// Mock employee services
export const mockEmployeeService = {
	getEmployees: vi.fn(),
	getEmployeeById: vi.fn(),
	createEmployee: vi.fn(),
	updateEmployee: vi.fn(),
	deleteEmployee: vi.fn(),
}

// Mock task services
export const mockTaskService = {
	getTasks: vi.fn(),
	getTaskById: vi.fn(),
	createTask: vi.fn(),
	updateTask: vi.fn(),
	deleteTask: vi.fn(),
}

// Mock health record services
export const mockHealthRecordService = {
	getHealthRecords: vi.fn(),
	getHealthRecordById: vi.fn(),
	createHealthRecord: vi.fn(),
	updateHealthRecord: vi.fn(),
	deleteHealthRecord: vi.fn(),
}

// Mock production record services
export const mockProductionRecordService = {
	getProductionRecords: vi.fn(),
	getProductionRecordById: vi.fn(),
	createProductionRecord: vi.fn(),
	updateProductionRecord: vi.fn(),
	deleteProductionRecord: vi.fn(),
}

// Mock species services
export const mockSpeciesService = {
	getSpecies: vi.fn(),
	getSpeciesById: vi.fn(),
	createSpecies: vi.fn(),
	updateSpecies: vi.fn(),
	deleteSpecies: vi.fn(),
}

// Mock breed services
export const mockBreedService = {
	getBreeds: vi.fn(),
	getBreedById: vi.fn(),
	createBreed: vi.fn(),
	updateBreed: vi.fn(),
	deleteBreed: vi.fn(),
}

// Mock farm services
export const mockFarmService = {
	getFarm: vi.fn(),
	updateFarm: vi.fn(),
}

// Mock user services
export const mockUserService = {
	getCurrentUser: vi.fn(),
	updateUser: vi.fn(),
	signIn: vi.fn(),
	signOut: vi.fn(),
	resetPassword: vi.fn(),
}
