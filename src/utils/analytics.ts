// Configuración de analytics
interface AnalyticsConfig {
	enabled: boolean
	debug: boolean
	userId?: string
}

interface UserProperties {
	role?: string
	farmId?: string
	language?: string
	email?: string
	name?: string
}

interface EventProperties {
	[key: string]: any
}

class Analytics {
	private config: AnalyticsConfig = {
		enabled: !import.meta.env.DEV,
		debug: import.meta.env.DEV,
	}

	private queue: Array<{ type: string; data: any }> = []

	constructor() {
		// Inicializar analytics en producción
		if (this.config.enabled) {
			this.initializeAnalytics()
		}
	}

	private initializeAnalytics() {
		// TODO: Inicializar servicio de analytics (Google Analytics, Mixpanel, etc.)
		if (this.config.debug) {
			console.log('Analytics initialized')
		}
	}

	identify(userId: string, properties?: UserProperties) {
		const data = {
			userId,
			properties,
			timestamp: new Date().toISOString(),
		}

		if (this.config.debug) {
			console.log('Analytics Identify:', data)
		}

		if (this.config.enabled) {
			// TODO: Enviar a servicio de analytics
			this.queue.push({ type: 'identify', data })
		}

		this.config.userId = userId
	}

	track(eventName: string, properties?: EventProperties) {
		const data = {
			event: eventName,
			properties: {
				...properties,
				userId: this.config.userId,
				timestamp: new Date().toISOString(),
				url: window.location.href,
				userAgent: navigator.userAgent,
			},
		}

		if (this.config.debug) {
			console.log('Analytics Track:', data)
		}

		if (this.config.enabled) {
			// TODO: Enviar a servicio de analytics
			this.queue.push({ type: 'track', data })
		}
	}

	page(pageName: string, properties?: EventProperties) {
		const data = {
			page: pageName,
			properties: {
				...properties,
				userId: this.config.userId,
				timestamp: new Date().toISOString(),
				url: window.location.href,
				referrer: document.referrer,
			},
		}

		if (this.config.debug) {
			console.log('Analytics Page:', data)
		}

		if (this.config.enabled) {
			// TODO: Enviar a servicio de analytics
			this.queue.push({ type: 'page', data })
		}
	}

	// Método para interacciones específicas
	trackInteraction(element: string, action: string, properties?: EventProperties) {
		this.track(`${element}_${action}`, {
			element,
			action,
			...properties,
		})
	}

	// Obtener cola de eventos (útil para debugging)
	getQueue() {
		return this.queue
	}

	// Limpiar cola
	clearQueue() {
		this.queue = []
	}
}

// Instancia singleton
const analytics = new Analytics()

// Funciones de conveniencia
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
	analytics.track(eventName, properties)
}

export const trackPage = (pageName: string, properties?: Record<string, any>) => {
	analytics.page(pageName, properties)
}

export const trackInteraction = (
	element: string,
	action: string,
	properties?: Record<string, any>
) => {
	analytics.trackInteraction(element, action, properties)
}

export const identifyUser = (userId: string, properties?: Partial<UserProperties>) => {
	analytics.identify(userId, properties)
}

// Eventos predefinidos para la aplicación
export const ANALYTICS_EVENTS = {
	// Autenticación
	LOGIN_SUCCESS: 'login_success',
	LOGIN_FAILED: 'login_failed',
	LOGOUT: 'logout',

	// Navegación
	PAGE_VIEW: 'page_view',
	LANGUAGE_CHANGED: 'language_changed',

	// Animales
	ANIMAL_CREATED: 'animal_created',
	ANIMAL_UPDATED: 'animal_updated',
	ANIMAL_DELETED: 'animal_deleted',
	ANIMAL_VIEWED: 'animal_viewed',

	// Empleados
	EMPLOYEE_CREATED: 'employee_created',
	EMPLOYEE_UPDATED: 'employee_updated',
	EMPLOYEE_DELETED: 'employee_deleted',

	// Tareas
	TASK_CREATED: 'task_created',
	TASK_COMPLETED: 'task_completed',
	TASK_UPDATED: 'task_updated',

	// Registros de salud
	HEALTH_RECORD_CREATED: 'health_record_created',
	HEALTH_RECORD_UPDATED: 'health_record_updated',

	// Registros de producción
	PRODUCTION_RECORD_CREATED: 'production_record_created',
	PRODUCTION_RECORD_UPDATED: 'production_record_updated',

	// Errores
	ERROR_OCCURRED: 'error_occurred',
	NETWORK_ERROR: 'network_error',

	// Funcionalidad offline
	OFFLINE_MODE_ENABLED: 'offline_mode_enabled',
	OFFLINE_QUEUE_PROCESSED: 'offline_queue_processed',
} as const

export default analytics
