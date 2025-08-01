import { beforeEach, describe, expect, it, vi } from 'vitest'

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

describe('FarmsService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should be tested when service is implemented', () => {
		expect(true).toBe(true)
	})
})
