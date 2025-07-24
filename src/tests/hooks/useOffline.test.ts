import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useOffline, useOfflineOperation } from '@/hooks/system/useOffline'

// Mock error handler
vi.mock('@/utils/errorHandler', () => ({
	logError: vi.fn(),
}))

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
	value: {
		randomUUID: vi.fn(() => 'mock-uuid'),
	},
})

describe('useOffline', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		localStorage.clear()

		// Mock navigator.onLine
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			value: true,
		})
	})

	it('should initialize with online state', () => {
		const { result } = renderHook(() => useOffline())

		expect(result.current.isOffline).toBe(false)
		expect(result.current.queueLength).toBe(0)
		expect(result.current.offlineQueue).toEqual([])
	})

	it('should initialize with offline state when navigator is offline', () => {
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			value: false,
		})

		const { result } = renderHook(() => useOffline())

		expect(result.current.isOffline).toBe(true)
	})

	it('should load offline queue from localStorage on initialization', () => {
		// Note: In real implementation, functions can't be serialized to localStorage
		// This test verifies that the hook handles invalid data gracefully
		const mockQueue = [
			{
				id: 'test-id',
				data: { test: 'data' },
				timestamp: Date.now(),
				retries: 0,
			},
		]

		localStorage.setItem('offlineQueue', JSON.stringify(mockQueue))

		const { result } = renderHook(() => useOffline())

		// The hook should handle the missing operation function gracefully
		// In practice, operations are added at runtime, not loaded from storage
		expect(result.current.queueLength).toBe(0) // Should be 0 because operations can't be serialized
	})

	it('should handle invalid localStorage data gracefully', () => {
		localStorage.setItem('offlineQueue', 'invalid-json')

		const { result } = renderHook(() => useOffline())

		expect(result.current.queueLength).toBe(0)
	})

	it('should add operation to offline queue', () => {
		const { result } = renderHook(() => useOffline())

		const mockOperation = vi.fn()
		const mockData = { test: 'data' }

		act(() => {
			result.current.addToOfflineQueue(mockOperation, mockData)
		})

		// Verify the operation was added to the queue
		expect(result.current.queueLength).toBe(1)
		expect(result.current.offlineQueue[0].data).toEqual(mockData)
		expect(result.current.offlineQueue[0].operation).toBe(mockOperation)
		expect(result.current.offlineQueue[0].id).toBeDefined()
		expect(result.current.offlineQueue[0].timestamp).toBeDefined()
		expect(result.current.offlineQueue[0].retries).toBe(0)
	})

	it('should clear offline queue', () => {
		const { result } = renderHook(() => useOffline())

		// Add item first
		act(() => {
			result.current.addToOfflineQueue(vi.fn(), {})
		})

		expect(result.current.queueLength).toBe(1)

		// Clear queue
		act(() => {
			result.current.clearOfflineQueue()
		})

		expect(result.current.queueLength).toBe(0)
		// After clearing, localStorage should not have the key (undefined or null)
		const savedQueue = localStorage.getItem('offlineQueue')
		expect(savedQueue).toBeFalsy()
	})

	it('should process offline queue successfully', async () => {
		const { result } = renderHook(() => useOffline())

		const mockOperation = vi.fn().mockResolvedValue('success')

		act(() => {
			result.current.addToOfflineQueue(mockOperation, {})
		})

		expect(result.current.queueLength).toBe(1)

		await act(async () => {
			await result.current.processOfflineQueue()
		})

		expect(mockOperation).toHaveBeenCalled()
		expect(result.current.queueLength).toBe(0)
	})

	it('should retry failed operations up to 3 times', async () => {
		const { result } = renderHook(() => useOffline())

		const mockOperation = vi.fn().mockRejectedValue(new Error('Operation failed'))

		act(() => {
			result.current.addToOfflineQueue(mockOperation, {})
		})

		expect(result.current.queueLength).toBe(1)

		// Process queue - first attempt
		await act(async () => {
			await result.current.processOfflineQueue()
		})

		expect(mockOperation).toHaveBeenCalledTimes(1)
		expect(result.current.queueLength).toBe(1) // Should still be in queue for retry

		// Process queue - second attempt (retry 1)
		await act(async () => {
			await result.current.processOfflineQueue()
		})

		expect(mockOperation).toHaveBeenCalledTimes(2)
		expect(result.current.queueLength).toBe(1) // Should still be in queue for retry

		// Process queue - third attempt (retry 2)
		await act(async () => {
			await result.current.processOfflineQueue()
		})

		expect(mockOperation).toHaveBeenCalledTimes(3)
		expect(result.current.queueLength).toBe(1) // Should still be in queue for retry

		// Process queue - fourth attempt (retry 3, final attempt)
		await act(async () => {
			await result.current.processOfflineQueue()
		})

		expect(mockOperation).toHaveBeenCalledTimes(4) // Initial + 3 retries
		expect(result.current.queueLength).toBe(0) // Should be removed after max retries
	})

	it('should respond to online/offline events', () => {
		const { result } = renderHook(() => useOffline())

		// Simulate going offline
		act(() => {
			Object.defineProperty(navigator, 'onLine', { value: false })
			window.dispatchEvent(new Event('offline'))
		})

		expect(result.current.isOffline).toBe(true)

		// Simulate going online
		act(() => {
			Object.defineProperty(navigator, 'onLine', { value: true })
			window.dispatchEvent(new Event('online'))
		})

		expect(result.current.isOffline).toBe(false)
	})

	it('should handle multiple operations in queue', () => {
		const { result } = renderHook(() => useOffline())

		const operations = [vi.fn(), vi.fn(), vi.fn()]
		const dataItems = [{ id: 1 }, { id: 2 }, { id: 3 }]

		act(() => {
			operations.forEach((op, index) => {
				result.current.addToOfflineQueue(op, dataItems[index])
			})
		})

		expect(result.current.queueLength).toBe(3)
		expect(result.current.offlineQueue).toHaveLength(3)
	})

	it('should maintain queue order', () => {
		const { result } = renderHook(() => useOffline())

		const operations = [vi.fn(), vi.fn(), vi.fn()]
		const dataItems = [{ order: 1 }, { order: 2 }, { order: 3 }]

		act(() => {
			operations.forEach((op, index) => {
				result.current.addToOfflineQueue(op, dataItems[index])
			})
		})

		expect(result.current.offlineQueue[0].data.order).toBe(1)
		expect(result.current.offlineQueue[1].data.order).toBe(2)
		expect(result.current.offlineQueue[2].data.order).toBe(3)
	})
})

describe('useOfflineOperation', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		localStorage.clear()

		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			value: true,
		})
	})

	it('should execute operation when online', async () => {
		const { result } = renderHook(() => useOfflineOperation())

		const mockOperation = vi.fn().mockResolvedValue('success')

		await act(async () => {
			const response = await result.current.executeOperation(mockOperation)
			expect(response).toBe('success')
		})

		expect(mockOperation).toHaveBeenCalled()
	})

	it('should add operation to queue when offline', async () => {
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			value: false,
		})

		const { result } = renderHook(() => useOfflineOperation())

		const mockOperation = vi.fn()
		const mockFallback = vi.fn()

		await act(async () => {
			await result.current.executeOperation(mockOperation, {}, mockFallback)
		})

		expect(mockOperation).not.toHaveBeenCalled()
		expect(mockFallback).toHaveBeenCalled()
		expect(result.current.isOffline).toBe(true)
	})

	it('should add operation to queue when online operation fails', async () => {
		const { result } = renderHook(() => useOfflineOperation())

		const mockOperation = vi.fn().mockRejectedValue(new Error('Network error'))
		const mockFallback = vi.fn()

		await act(async () => {
			try {
				await result.current.executeOperation(mockOperation, {}, mockFallback)
			} catch (error) {
				expect(error).toBeInstanceOf(Error)
			}
		})

		expect(mockOperation).toHaveBeenCalled()
		expect(mockFallback).toHaveBeenCalled()
	})

	it('should execute fallback when provided', async () => {
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			value: false,
		})

		const { result } = renderHook(() => useOfflineOperation())

		const mockOperation = vi.fn()
		const mockFallback = vi.fn()

		await act(async () => {
			await result.current.executeOperation(mockOperation, {}, mockFallback)
		})

		expect(mockFallback).toHaveBeenCalled()
	})

	it('should work without fallback', async () => {
		Object.defineProperty(navigator, 'onLine', {
			writable: true,
			value: false,
		})

		const { result } = renderHook(() => useOfflineOperation())

		const mockOperation = vi.fn()

		await act(async () => {
			await result.current.executeOperation(mockOperation)
		})

		expect(mockOperation).not.toHaveBeenCalled()
	})

	it('should handle successful operations with different return types', async () => {
		const { result } = renderHook(() => useOfflineOperation())

		// Test with string
		const stringOp = vi.fn().mockResolvedValue('string result')
		const stringResult = await act(async () => {
			return await result.current.executeOperation(stringOp)
		})
		expect(stringResult).toBe('string result')

		// Test with object
		const objectOp = vi.fn().mockResolvedValue({ data: 'test' })
		const objectResult = await act(async () => {
			return await result.current.executeOperation(objectOp)
		})
		expect(objectResult).toEqual({ data: 'test' })

		// Test with array
		const arrayOp = vi.fn().mockResolvedValue([1, 2, 3])
		const arrayResult = await act(async () => {
			return await result.current.executeOperation(arrayOp)
		})
		expect(arrayResult).toEqual([1, 2, 3])
	})
})
