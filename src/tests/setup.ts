import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test
afterEach(() => {
	cleanup()
})

// Mock Firebase
vi.mock('@/config/firebaseConfig', () => ({
	auth: {},
	db: {},
	storage: {},
}))

// Mock environment variables
vi.mock('@/config/environment', () => ({
	ENVIRONMENT: 'test',
	FIREBASE_CONFIG: {
		apiKey: 'test-api-key',
		authDomain: 'test.firebaseapp.com',
		projectId: 'test-project',
		storageBucket: 'test.appspot.com',
		messagingSenderId: '123456789',
		appId: 'test-app-id',
	},
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
	observe: vi.fn(),
	disconnect: vi.fn(),
	unobserve: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
	observe: vi.fn(),
	disconnect: vi.fn(),
	unobserve: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
})

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
	value: sessionStorageMock,
})

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
	writable: true,
	value: vi.fn(() => 'mocked-url'),
})

// Mock URL.revokeObjectURL
Object.defineProperty(URL, 'revokeObjectURL', {
	writable: true,
	value: vi.fn(),
})

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
	value: {
		writeText: vi.fn(),
		readText: vi.fn(),
	},
})

// Mock console methods to reduce noise in tests
beforeAll(() => {
	vi.spyOn(console, 'warn').mockImplementation(() => {})
	vi.spyOn(console, 'error').mockImplementation(() => {})
})
