import { vi } from 'vitest'

// Mock global para analytics
export const mockAnalytics = {
	trackEvent: vi.fn(),
	trackPage: vi.fn(),
	trackInteraction: vi.fn(),
	identifyUser: vi.fn(),
	ANALYTICS_EVENTS: {
		PAGE_VIEW: 'page_view',
		LOGIN_SUCCESS: 'login_success',
		LOGIN_FAILED: 'login_failed',
		LOGOUT: 'logout',
		LANGUAGE_CHANGED: 'language_changed',
		ANIMAL_CREATED: 'animal_created',
		ANIMAL_UPDATED: 'animal_updated',
		ANIMAL_DELETED: 'animal_deleted',
		ANIMAL_VIEWED: 'animal_viewed',
		EMPLOYEE_CREATED: 'employee_created',
		EMPLOYEE_UPDATED: 'employee_updated',
		EMPLOYEE_DELETED: 'employee_deleted',
		TASK_CREATED: 'task_created',
		TASK_COMPLETED: 'task_completed',
		TASK_UPDATED: 'task_updated',
		HEALTH_RECORD_CREATED: 'health_record_created',
		HEALTH_RECORD_UPDATED: 'health_record_updated',
		PRODUCTION_RECORD_CREATED: 'production_record_created',
		PRODUCTION_RECORD_UPDATED: 'production_record_updated',
		ERROR_OCCURRED: 'error_occurred',
		NETWORK_ERROR: 'network_error',
		OFFLINE_MODE_ENABLED: 'offline_mode_enabled',
		OFFLINE_QUEUE_PROCESSED: 'offline_queue_processed',
	},
}

// Mock global para Firebase
export const mockFirebase = {
	collection: vi.fn(),
	doc: vi.fn(),
	getDoc: vi.fn(),
	getDocs: vi.fn(),
	query: vi.fn(),
	setDoc: vi.fn(),
	where: vi.fn(),
}

// Mock global para servicios
export const mockServices = {
	AnimalsService: {
		getAnimals: vi.fn(),
		getAnimal: vi.fn(),
		getAnimalsBySpecies: vi.fn(),
		setAnimal: vi.fn(),
		updateAnimal: vi.fn(),
		deleteAnimal: vi.fn(),
	},
	FarmsService: {
		getFarm: vi.fn(),
		setFarm: vi.fn(),
		updateFarm: vi.fn(),
	},
	BillingCardsService: {
		getBillingCardByUuid: vi.fn(),
	},
	SpeciesService: {
		getAllSpecies: vi.fn(),
	},
	BreedsService: {
		getAllBreeds: vi.fn(),
	},
}

// Mock global para GSAP
export const mockGsap = {
	to: vi.fn(),
	from: vi.fn(),
	set: vi.fn(),
	timeline: vi.fn(() => ({
		to: vi.fn(),
		from: vi.fn(),
		set: vi.fn(),
	})),
}

// Mock global para storage
export const mockStorage = {
	setPicture: vi.fn(),
	getPicture: vi.fn(),
}
