import { type RenderOptions, render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'

// Wrapper personalizado para tests
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
	return <BrowserRouter>{children}</BrowserRouter>
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
	render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Utilidades de testing
export const createMockUser = (overrides = {}) => ({
	uuid: 'test-user-id',
	name: 'Test User',
	lastName: 'Test LastName',
	email: 'test@example.com',
	role: 'owner',
	farmUuid: 'test-farm-id',
	language: 'spa',
	status: true,
	phone: '1234567890',
	photoUrl: '',
	...overrides,
})

export const createMockAnimal = (overrides = {}) => ({
	uuid: 'test-animal-id',
	farmUuid: 'test-farm-id',
	speciesUuid: 'test-species-id',
	breedUuid: 'test-breed-id',
	animalId: '001',
	gender: 'Female' as const,
	color: 'Brown',
	weight: 500,
	status: true,
	origin: 'Born on farm',
	picture: '',
	birthDate: '2023-01-01',
	...overrides,
})

export const createMockFarm = (overrides = {}) => ({
	uuid: 'test-farm-id',
	name: 'Test Farm',
	address: 'Test Address',
	liquidUnit: 'L',
	weightUnit: 'Kg',
	temperatureUnit: '°C',
	status: true,
	billingCardUuid: 'test-billing-id',
	...overrides,
})

export const createMockTask = (overrides = {}) => ({
	uuid: 'test-task-id',
	farmUuid: 'test-farm-id',
	title: 'Test Task',
	description: 'Test task description',
	status: 'pending' as const,
	priority: 'medium' as const,
	assignedTo: 'test-user-id',
	dueDate: '2024-12-31',
	createdAt: '2024-01-01',
	...overrides,
})

export const createMockHealthRecord = (overrides = {}) => ({
	uuid: 'test-health-record-id',
	animalUuid: 'test-animal-id',
	farmUuid: 'test-farm-id',
	type: 'vaccination' as const,
	description: 'Annual vaccination',
	date: '2024-01-15',
	veterinarian: 'Dr. Smith',
	cost: 50,
	notes: 'No adverse reactions',
	...overrides,
})

export const createMockProductionRecord = (overrides = {}) => ({
	uuid: 'test-production-record-id',
	animalUuid: 'test-animal-id',
	farmUuid: 'test-farm-id',
	type: 'milk' as const,
	quantity: 25.5,
	unit: 'L',
	date: '2024-01-15',
	quality: 'excellent' as const,
	notes: 'High quality milk',
	...overrides,
})

export const createMockEmployee = (overrides = {}) => ({
	uuid: 'test-employee-id',
	farmUuid: 'test-farm-id',
	name: 'John',
	lastName: 'Doe',
	email: 'john.doe@example.com',
	role: 'employee' as const,
	phone: '1234567890',
	status: true,
	...overrides,
})

export const createMockSpecies = (overrides = {}) => ({
	uuid: 'test-species-id',
	farmUuid: 'test-farm-id',
	name: 'Cattle',
	description: 'Dairy cattle',
	status: true,
	...overrides,
})

export const createMockBreed = (overrides = {}) => ({
	uuid: 'test-breed-id',
	speciesUuid: 'test-species-id',
	name: 'Holstein',
	description: 'Holstein dairy breed',
	status: true,
	...overrides,
})
