export class AppError extends Error {
	code: string
	statusCode: number
	context?: Record<string, any>

	constructor(message: string, code: string, statusCode = 500, context?: Record<string, any>) {
		super(message)
		this.name = 'AppError'
		this.code = code
		this.statusCode = statusCode
		this.context = context
	}
}

export class ValidationError extends AppError {
	constructor(message: string, field?: string) {
		super(message, 'VALIDATION_ERROR', 400, { field })
		this.name = 'ValidationError'
	}
}

export class NetworkError extends AppError {
	constructor(message = 'Error de conexión') {
		super(message, 'NETWORK_ERROR', 503)
		this.name = 'NetworkError'
	}
}

export class AuthError extends AppError {
	constructor(message = 'Error de autenticación') {
		super(message, 'AUTH_ERROR', 401)
		this.name = 'AuthError'
	}
}

export class PermissionError extends AppError {
	constructor(message = 'No tienes permisos para realizar esta acción') {
		super(message, 'PERMISSION_ERROR', 403)
		this.name = 'PermissionError'
	}
}

export const logError = (error: unknown, context?: Record<string, any>) => {
	const errorInfo = {
		message: error instanceof Error ? error.message : 'Unknown error',
		stack: error instanceof Error ? error.stack : undefined,
		timestamp: new Date().toISOString(),
		context,
		userAgent: navigator.userAgent,
		url: window.location.href,
	}

	console.error('App Error:', errorInfo)

	// En producción, enviar a servicio de logging (Sentry, LogRocket, etc.)
	if (import.meta.env.PROD) {
		// TODO: Integrar con servicio de logging externo
		// Sentry.captureException(error, { extra: errorInfo })
	}
}
