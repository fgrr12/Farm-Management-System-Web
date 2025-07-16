import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAppStore } from '@/store/useAppStore'

/**
 * Custom hook for common page performance patterns
 * Provides optimized handlers for common page operations
 */
export const usePagePerformance = () => {
	const { setHeaderTitle, setLoading, setToastData } = useAppStore()

	// Memoized header title setter
	const setPageTitle = useCallback(
		(title: string) => {
			setHeaderTitle(title)
		},
		[setHeaderTitle]
	)

	// Memoized loading state handler
	const handleLoading = useCallback(
		(loading: boolean) => {
			setLoading(loading)
		},
		[setLoading]
	)

	// Memoized toast handler
	const showToast = useCallback(
		(message: string, type: 'success' | 'error' | 'info' | 'warning') => {
			setToastData({ message, type })
		},
		[setToastData]
	)

	// Generic async operation wrapper with loading and error handling
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

	return {
		setPageTitle,
		handleLoading,
		showToast,
		withLoadingAndError,
	}
}

/**
 * Custom hook for form performance optimization
 * Provides memoized form handlers to prevent unnecessary re-renders
 */
export const useFormPerformance = <T extends Record<string, any>>(
	setState: React.Dispatch<React.SetStateAction<T>>
) => {
	// Memoized text input handler
	const handleTextChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value } = event.target
			setState((prev) => ({ ...prev, [name]: value }))
		},
		[setState]
	)

	// Memoized select handler
	const handleSelectChange = useCallback(
		(event: React.ChangeEvent<HTMLSelectElement>) => {
			const { name, value } = event.target
			setState((prev) => ({ ...prev, [name]: value }))
		},
		[setState]
	)

	// Memoized checkbox handler
	const handleCheckboxChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const { name, checked } = event.target
			setState((prev) => ({ ...prev, [name]: checked }))
		},
		[setState]
	)

	// Generic field updater
	const updateField = useCallback(
		(field: keyof T, value: any) => {
			setState((prev) => ({ ...prev, [field]: value }))
		},
		[setState]
	)

	return {
		handleTextChange,
		handleSelectChange,
		handleCheckboxChange,
		updateField,
	}
}

/**
 * Custom hook for search and filter performance
 * Provides debounced search and memoized filter handlers
 */
export const useSearchAndFilter = <T>(items: T[], searchFields: (keyof T)[], debounceMs = 300) => {
	const [searchTerm, setSearchTerm] = useState('')
	const [filters, setFilters] = useState<Record<string, any>>({})

	// Debounced search term update
	const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)

	// Memoized filtered results
	const filteredItems = useMemo(() => {
		let result = items

		// Apply search filter
		if (debouncedSearchTerm) {
			const searchLower = debouncedSearchTerm.toLowerCase()
			result = result.filter((item) =>
				searchFields.some((field) => String(item[field]).toLowerCase().includes(searchLower))
			)
		}

		// Apply additional filters
		Object.entries(filters).forEach(([key, value]) => {
			if (value && value !== '') {
				result = result.filter((item) => item[key as keyof T] === value)
			}
		})

		return result
	}, [items, debouncedSearchTerm, filters, searchFields])

	// Memoized search handler
	const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value)
	}, [])

	// Memoized filter handler
	const handleFilterChange = useCallback((key: string, value: any) => {
		setFilters((prev: Record<string, any>) => ({ ...prev, [key]: value }))
	}, [])

	return {
		searchTerm,
		filteredItems,
		handleSearch,
		handleFilterChange,
		setFilters,
	}
}

// Simple debounce hook
const useDebounce = <T>(value: T, delay: number): T => {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])

	return debouncedValue
}
