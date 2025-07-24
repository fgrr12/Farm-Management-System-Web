import { useCallback } from 'react'

import { useAppStore } from '@/store/useAppStore'

import { AppError, logError } from '@/utils/errorHandler'

export const useErrorHandler = () => {
	const { setToastData } = useAppStore()

	const handleError = useCallback(
		(error: unknown, context?: Record<string, any>) => {
			logError(error, context)
			if (error instanceof AppError) {
				setToastData({
					message: error.message,
					type: error.statusCode >= 500 ? 'error' : 'warning',
				})
			} else if (error instanceof Error) {
				setToastData({
					message: error.message || 'An unexpected error occurred',
					type: 'error',
				})
			} else {
				setToastData({
					message: 'An unexpected error occurred',
					type: 'error',
				})
			}
		},
		[setToastData]
	)

	const handleAsyncError = useCallback(
		async <T>(asyncFn: () => Promise<T>, context?: Record<string, any>): Promise<T | undefined> => {
			try {
				return await asyncFn()
			} catch (error) {
				handleError(error, context)
				throw error
			}
		},
		[handleError]
	)

	return {
		handleError,
		handleAsyncError,
	}
}
