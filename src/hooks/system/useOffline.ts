import { useCallback, useEffect, useState } from 'react'

import { logError } from '@/utils/errorHandler'

interface OfflineQueueItem {
	id: string
	operation: () => Promise<any>
	data: any
	timestamp: number
	retries: number
}

export const useOffline = () => {
	const [isOffline, setIsOffline] = useState(!navigator.onLine)
	const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([])

	const processOfflineQueue = useCallback(async () => {
		if (offlineQueue.length === 0) return

		const processedItems: string[] = []
		const failedItems: OfflineQueueItem[] = []

		for (const item of offlineQueue) {
			try {
				await item.operation()
				processedItems.push(item.id)
			} catch (error) {
				logError(error, {
					context: 'offline_queue_processing',
					itemId: item.id,
					retries: item.retries,
				})

				if (item.retries < 3) {
					failedItems.push({
						...item,
						retries: item.retries + 1,
					})
				} else {
					processedItems.push(item.id)
				}
			}
		}

		setOfflineQueue((prev) => [
			...failedItems,
			...prev.filter(
				(item) =>
					!processedItems.includes(item.id) && !failedItems.some((failed) => failed.id === item.id)
			),
		])
	}, [offlineQueue])

	useEffect(() => {
		const savedQueue = localStorage.getItem('offlineQueue')
		if (savedQueue) {
			try {
				const parsedQueue = JSON.parse(savedQueue)
				setOfflineQueue(parsedQueue)
			} catch (error) {
				logError(error, { context: 'loading_offline_queue' })
			}
		}
	}, [])

	useEffect(() => {
		if (offlineQueue.length > 0) {
			localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue))
		} else {
			localStorage.removeItem('offlineQueue')
		}
	}, [offlineQueue])

	useEffect(() => {
		const handleOnline = () => {
			setIsOffline(false)
			processOfflineQueue()
		}

		const handleOffline = () => {
			setIsOffline(true)
		}

		window.addEventListener('online', handleOnline)
		window.addEventListener('offline', handleOffline)

		return () => {
			window.removeEventListener('online', handleOnline)
			window.removeEventListener('offline', handleOffline)
		}
	}, [processOfflineQueue])

	const addToOfflineQueue = useCallback((operation: () => Promise<any>, data: any) => {
		const queueItem: OfflineQueueItem = {
			id: crypto.randomUUID(),
			operation,
			data,
			timestamp: Date.now(),
			retries: 0,
		}

		setOfflineQueue((prev) => [...prev, queueItem])
	}, [])

	const clearOfflineQueue = useCallback(() => {
		setOfflineQueue([])
	}, [])

	return {
		isOffline,
		offlineQueue,
		queueLength: offlineQueue.length,
		addToOfflineQueue,
		clearOfflineQueue,
		processOfflineQueue,
	}
}

/**
 * Hook for operations that should work offline
 */
export const useOfflineOperation = () => {
	const { isOffline, addToOfflineQueue } = useOffline()

	const executeOperation = async (
		operation: () => Promise<any>,
		data?: any,
		fallback?: () => void
	) => {
		if (!isOffline) {
			try {
				return await operation()
			} catch (error) {
				addToOfflineQueue(operation, data)
				if (fallback) fallback()
				throw error
			}
		} else {
			addToOfflineQueue(operation, data)
			if (fallback) fallback()
		}
	}

	return {
		executeOperation,
		isOffline,
	}
}
