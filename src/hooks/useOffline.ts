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

	// Procesar cola offline cuando se recupere la conexión
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

				// Reintentar hasta 3 veces
				if (item.retries < 3) {
					failedItems.push({
						...item,
						retries: item.retries + 1,
					})
				} else {
					// Después de 3 reintentos, marcar como procesado para eliminarlo
					processedItems.push(item.id)
				}
			}
		}

		// Actualizar cola: remover procesados, mantener fallidos
		setOfflineQueue((prev) => [
			...failedItems,
			...prev.filter(
				(item) =>
					!processedItems.includes(item.id) && !failedItems.some((failed) => failed.id === item.id)
			),
		])
	}, [offlineQueue])

	// Cargar cola desde localStorage al inicializar
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

	// Guardar cola en localStorage cuando cambie
	useEffect(() => {
		if (offlineQueue.length > 0) {
			localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue))
		} else {
			localStorage.removeItem('offlineQueue')
		}
	}, [offlineQueue])

	// Escuchar cambios de conectividad
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

	// Agregar operación a la cola offline
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

	// Limpiar cola offline
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
 * Hook para operaciones que deben funcionar offline
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
				// Si falla online, agregar a cola offline
				addToOfflineQueue(operation, data)
				if (fallback) fallback()
				throw error
			}
		} else {
			// Si está offline, agregar directamente a la cola
			addToOfflineQueue(operation, data)
			if (fallback) fallback()
		}
	}

	return {
		executeOperation,
		isOffline,
	}
}
