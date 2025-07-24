import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUserStore } from '@/store/useUserStore/useUser.Store'

import { createMockUser } from '@/tests/utils/test-utils'

// Mock zustand persist
vi.mock('zustand/middleware', () => ({
	persist: vi.fn((config) => config),
	createJSONStorage: vi.fn(() => ({})),
}))

describe('useUserStore', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Reset store state
		useUserStore.setState({ user: null })
	})

	it('should initialize with null user', () => {
		const { result } = renderHook(() => useUserStore())

		expect(result.current.user).toBeNull()
	})

	it('should set user', () => {
		const { result } = renderHook(() => useUserStore())
		const mockUser = createMockUser()

		act(() => {
			result.current.setUser(mockUser)
		})

		expect(result.current.user).toEqual(mockUser)
	})

	it('should clear user by setting to null', () => {
		const { result } = renderHook(() => useUserStore())
		const mockUser = createMockUser()

		// First set a user
		act(() => {
			result.current.setUser(mockUser)
		})

		expect(result.current.user).toEqual(mockUser)

		// Then clear the user
		act(() => {
			result.current.setUser(null)
		})

		expect(result.current.user).toBeNull()
	})

	it('should update user data', () => {
		const { result } = renderHook(() => useUserStore())
		const mockUser = createMockUser({ name: 'John' })

		act(() => {
			result.current.setUser(mockUser)
		})

		expect(result.current.user?.name).toBe('John')

		// Update user with new data
		const updatedUser = { ...mockUser, name: 'Jane' }

		act(() => {
			result.current.setUser(updatedUser)
		})

		expect(result.current.user?.name).toBe('Jane')
	})

	it('should handle multiple subscribers', () => {
		const { result: result1 } = renderHook(() => useUserStore())
		const { result: result2 } = renderHook(() => useUserStore())

		const mockUser = createMockUser()

		act(() => {
			result1.current.setUser(mockUser)
		})

		// Both hooks should have the same user
		expect(result1.current.user).toEqual(mockUser)
		expect(result2.current.user).toEqual(mockUser)
	})

	it('should maintain user state across re-renders', () => {
		const { result, rerender } = renderHook(() => useUserStore())
		const mockUser = createMockUser()

		act(() => {
			result.current.setUser(mockUser)
		})

		rerender()

		expect(result.current.user).toEqual(mockUser)
	})

	it('should handle user with different roles', () => {
		const { result } = renderHook(() => useUserStore())

		const ownerUser = createMockUser({ role: 'owner' })
		const adminUser = createMockUser({ role: 'admin' })
		const employeeUser = createMockUser({ role: 'employee' })

		// Test owner
		act(() => {
			result.current.setUser(ownerUser)
		})
		expect(result.current.user?.role).toBe('owner')

		// Test admin
		act(() => {
			result.current.setUser(adminUser)
		})
		expect(result.current.user?.role).toBe('admin')

		// Test employee
		act(() => {
			result.current.setUser(employeeUser)
		})
		expect(result.current.user?.role).toBe('employee')
	})

	it('should handle user status changes', () => {
		const { result } = renderHook(() => useUserStore())
		const activeUser = createMockUser({ status: true })

		act(() => {
			result.current.setUser(activeUser)
		})

		expect(result.current.user?.status).toBe(true)

		// Deactivate user
		const inactiveUser = { ...activeUser, status: false }

		act(() => {
			result.current.setUser(inactiveUser)
		})

		expect(result.current.user?.status).toBe(false)
	})
})
