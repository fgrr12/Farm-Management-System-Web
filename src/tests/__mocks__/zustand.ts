import { vi } from 'vitest'

// Mock zustand create function
const createMock = vi.fn((createState) => {
	const store = createState(vi.fn(), vi.fn(), vi.fn())
	return () => store
})

export const create = createMock
export default createMock
