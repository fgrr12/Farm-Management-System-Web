import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useErrorHandler } from '@/hooks/useErrorHandler'

// Mock store
const mockSetToastData = vi.fn()
vi.mock('@/store/useAppStore', () => ({
	useAppStore: () => ({
		setToastData: mockSetToastData,
	}),
}))

// Mock error handler utility
vi.mock('@/utils/errorHandler', () => ({
	logError: vi.fn(),
	AppError: class AppError extends Error {
		public code: string
		public statusCode: number

		constructor(message: string, code: string, statusCode = 500) {
			super(message)
			this.code = code
			this.statusCode = statusCode
			this.name = 'AppError'
		}
	},
}))

describe('useErrorHandler', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('handleError', () => {
		it('should handle AppError with status code >= 500 as error', async () => {
			const { result } = renderHook(() => useErrorHandler())
			const { AppError } = await import('@/utils/errorHandler')
			const serverError = new AppError('Server error', 'SERVER_ERROR', 500)

			act(() => {
				result.current.handleError(serverError)
			})

			const { logError } = await import('@/utils/errorHandler')
			expect(logError).toHaveBeenCalledWith(serverError, undefined)
			expect(mockSetToastData).toHaveBeenCalledWith({
				message: 'Server error',
				type: 'error',
			})
		})

		it('should handle AppError with status code < 500 as warning', async () => {
			const { result } = renderHook(() => useErrorHandler())
			const { AppError, logError } = await import('@/utils/errorHandler')
			const clientError = new AppError('Validation error', 'VALIDATION_ERROR', 400)

			act(() => {
				result.current.handleError(clientError)
			})

			expect(logError).toHaveBeenCalledWith(clientError, undefined)
			expect(mockSetToastData).toHaveBeenCalledWith({
				message: 'Validation error',
				type: 'warning',
			})
		})

		it('should handle generic JavaScript Error', async () => {
			const { result } = renderHook(() => useErrorHandler())
			const genericError = new Error('Generic error message')

			act(() => {
				result.current.handleError(genericError)
			})

			const { logError } = await import('@/utils/errorHandler')
			expect(logError).toHaveBeenCalledWith(genericError, undefined)
			expect(mockSetToastData).toHaveBeenCalledWith({
				message: 'Generic error message',
				type: 'error',
			})
		})

		it('should handle Error without message', async () => {
			const { result } = renderHook(() => useErrorHandler())
			const errorWithoutMessage = new Error('')

			act(() => {
				result.current.handleError(errorWithoutMessage)
			})

			const { logError } = await import('@/utils/errorHandler')
			expect(logError).toHaveBeenCalledWith(errorWithoutMessage, undefined)
			expect(mockSetToastData).toHaveBeenCalledWith({
				message: 'An unexpected error occurred',
				type: 'error',
			})
		})

		it('should handle unknown error types', async () => {
			const { result } = renderHook(() => useErrorHandler())
			const unknownError = 'string error'

			act(() => {
				result.current.handleError(unknownError)
			})

			const { logError } = await import('@/utils/errorHandler')
			expect(logError).toHaveBeenCalledWith(unknownError, undefined)
			expect(mockSetToastData).toHaveBeenCalledWith({
				message: 'An unexpected error occurred',
				type: 'error',
			})
		})

		it('should handle error with context', async () => {
			const { result } = renderHook(() => useErrorHandler())
			const error = new Error('Test error')
			const context = { userId: '123', action: 'save' }

			act(() => {
				result.current.handleError(error, context)
			})

			const { logError } = await import('@/utils/errorHandler')
			expect(logError).toHaveBeenCalledWith(error, context)
			expect(mockSetToastData).toHaveBeenCalledWith({
				message: 'Test error',
				type: 'error',
			})
		})

		it('should handle different AppError status codes', async () => {
			const { result } = renderHook(() => useErrorHandler())
			const { AppError } = await import('@/utils/errorHandler')

			// Test 404 error (client error)
			const notFoundError = new AppError('Not found', 'NOT_FOUND', 404)
			act(() => {
				result.current.handleError(notFoundError)
			})

			expect(mockSetToastData).toHaveBeenCalledWith({
				message: 'Not found',
				type: 'warning',
			})

			// Test 503 error (server error)
			const serviceUnavailableError = new AppError(
				'Service unavailable',
				'SERVICE_UNAVAILABLE',
				503
			)
			act(() => {
				result.current.handleError(serviceUnavailableError)
			})

			expect(mockSetToastData).toHaveBeenCalledWith({
				message: 'Service unavailable',
				type: 'error',
			})
		})

		it('should handle null and undefined errors', () => {
			const { result } = renderHook(() => useErrorHandler())

			act(() => {
				result.current.handleError(null)
			})

			expect(mockSetToastData).toHaveBeenCalledWith({
				message: 'An unexpected error occurred',
				type: 'error',
			})

			act(() => {
				result.current.handleError(undefined)
			})

			expect(mockSetToastData).toHaveBeenCalledWith({
				message: 'An unexpected error occurred',
				type: 'error',
			})
		})
	})

	describe('handleAsyncError', () => {
		it('should handle async function successfully', async () => {
			const { result } = renderHook(() => useErrorHandler())
			const successfulAsyncFn = vi.fn().mockResolvedValue('success')

			let response: string | undefined
			await act(async () => {
				response = await result.current.handleAsyncError(successfulAsyncFn)
			})

			expect(successfulAsyncFn).toHaveBeenCalled()
			expect(response).toBe('success')
			const { logError } = await import('@/utils/errorHandler')
			expect(logError).not.toHaveBeenCalled()
			expect(mockSetToastData).not.toHaveBeenCalled()
		})

		it('should handle async function that throws error', async () => {
			const { result } = renderHook(() => useErrorHandler())
			const error = new Error('Async error')
			const failingAsyncFn = vi.fn().mockRejectedValue(error)

			await act(async () => {
				try {
					await result.current.handleAsyncError(failingAsyncFn)
				} catch (thrownError) {
					expect(thrownError).toBe(error)
				}
			})

			expect(failingAsyncFn).toHaveBeenCalled()
			const { logError } = await import('@/utils/errorHandler')
			expect(logError).toHaveBeenCalledWith(error, undefined)
			expect(mockSetToastData).toHaveBeenCalledWith({
				message: 'Async error',
				type: 'error',
			})
		})

		it('should handle async function with context', async () => {
			const { result } = renderHook(() => useErrorHandler())
			const error = new Error('Async error with context')
			const failingAsyncFn = vi.fn().mockRejectedValue(error)
			const context = { operation: 'fetch', resource: 'animals' }

			await act(async () => {
				try {
					await result.current.handleAsyncError(failingAsyncFn, context)
				} catch (thrownError) {
					expect(thrownError).toBe(error)
				}
			})

			const { logError } = await import('@/utils/errorHandler')
			expect(logError).toHaveBeenCalledWith(error, context)
			expect(mockSetToastData).toHaveBeenCalledWith({
				message: 'Async error with context',
				type: 'error',
			})
		})

		it('should re-throw error in handleAsyncError', async () => {
			const { result } = renderHook(() => useErrorHandler())
			const error = new Error('Test error')
			const failingAsyncFn = vi.fn().mockRejectedValue(error)

			await expect(
				act(async () => {
					await result.current.handleAsyncError(failingAsyncFn)
				})
			).rejects.toThrow('Test error')
		})

		it('should handle async function that returns different data types', async () => {
			const { result } = renderHook(() => useErrorHandler())

			// Test with object
			const objectFn = vi.fn().mockResolvedValue({ data: 'test' })
			let objectResult: any
			await act(async () => {
				objectResult = await result.current.handleAsyncError(objectFn)
			})
			expect(objectResult).toEqual({ data: 'test' })

			// Test with array
			const arrayFn = vi.fn().mockResolvedValue([1, 2, 3])
			let arrayResult: any
			await act(async () => {
				arrayResult = await result.current.handleAsyncError(arrayFn)
			})
			expect(arrayResult).toEqual([1, 2, 3])

			// Test with null
			const nullFn = vi.fn().mockResolvedValue(null)
			let nullResult: any
			await act(async () => {
				nullResult = await result.current.handleAsyncError(nullFn)
			})
			expect(nullResult).toBeNull()
		})

		it('should handle multiple concurrent async operations', async () => {
			const { result } = renderHook(() => useErrorHandler())
			const successFn1 = vi.fn().mockResolvedValue('result1')
			const successFn2 = vi.fn().mockResolvedValue('result2')
			const errorFn = vi.fn().mockRejectedValue(new Error('Concurrent error'))

			const promises = [
				result.current.handleAsyncError(successFn1),
				result.current.handleAsyncError(successFn2),
				result.current.handleAsyncError(errorFn).catch(() => 'handled'),
			]

			let results: any[] = []
			await act(async () => {
				results = await Promise.all(promises)
			})

			expect(results).toEqual(['result1', 'result2', 'handled'])
			const { logError } = await import('@/utils/errorHandler')
			expect(logError).toHaveBeenCalledTimes(1)
		})
	})

	describe('hook stability', () => {
		it('should maintain function references across re-renders', () => {
			const { result, rerender } = renderHook(() => useErrorHandler())

			const firstHandleError = result.current.handleError
			const firstHandleAsyncError = result.current.handleAsyncError

			rerender()

			expect(result.current.handleError).toBe(firstHandleError)
			expect(result.current.handleAsyncError).toBe(firstHandleAsyncError)
		})
	})
})
