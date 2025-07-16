import { useCallback } from 'react'

import { useAppStore } from '@/store/useAppStore'

import { AppError, logError } from '@/utils/errorHandler'

export const useErrorHandler = () => {
	const { setToastData } = useAppStore()

	const handleError = useCallback(
		(error: unknown, context?: Record<string, any>) => {
			// Log del error
			logError(error, context)

			// Determinar el tipo de error y mostrar mensaje apropiado
			if (error instanceof AppError) {
				setToastData({
					message: error.message,
					type: error.statusCode >= 500 ? 'error' : 'warning',
				})
			} else if (error instanceof Error) {
				// Error genérico de JavaScript
				setToastData({
					message: error.message || 'Ha ocurrido un error inesperado',
					type: 'error',
				})
			} else {
				// Error desconocido
				setToastData({
					message: 'Ha ocurrido un error inesperado',
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
				throw error // Re-throw para que el componente pueda manejar el error si es necesario
			}
		},
		[handleError]
	)

	return {
		handleError,
		handleAsyncError,
	}
}
