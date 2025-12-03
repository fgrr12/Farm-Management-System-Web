import { useCallback } from 'react'

import { useAppStore } from '@/store/useAppStore'

/**
 * Custom hook for common page performance patterns
 * Provides optimized handlers for common page operations
 */
export const usePagePerformance = () => {
	const { setHeaderTitle, setLoading, setToastData } = useAppStore()

	const setPageTitle = useCallback(
		(title: string) => {
			setHeaderTitle(title)
		},
		[setHeaderTitle]
	)

	const handleLoading = useCallback(
		(loading: boolean) => {
			setLoading(loading)
		},
		[setLoading]
	)

	const showToast = useCallback(
		(message: string, type: 'success' | 'error' | 'info' | 'warning') => {
			setToastData({ message, type })
		},
		[setToastData]
	)

	const withLoadingAndError = useCallback(
		async <T>(
			operation: () => Promise<T>,
			errorMessage: string,
			successMessage?: string
		): Promise<T | null> => {
			try {
				setLoading(true)
				const result = await operation()
				if (successMessage) {
					setToastData({ message: successMessage, type: 'success' })
				}
				return result
			} catch (error) {
				console.error('Operation failed:', error)
				setToastData({ message: errorMessage, type: 'error' })
				return null
			} finally {
				setLoading(false)
			}
		},
		[setLoading, setToastData]
	)

	const withError = useCallback(
		async <T>(
			operation: () => Promise<T>,
			errorMessage: string,
			successMessage?: string
		): Promise<T | null> => {
			try {
				const result = await operation()
				if (successMessage) {
					setToastData({ message: successMessage, type: 'success' })
				}
				return result
			} catch (error) {
				console.error('Operation failed:', error)
				setToastData({ message: errorMessage, type: 'error' })
				return null
			}
		},
		[setToastData]
	)

	return {
		setPageTitle,
		handleLoading,
		showToast,
		withLoadingAndError,
		withError,
	}
}
