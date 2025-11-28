// Analytics configuration
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
		if (this.config.enabled) {
			// this.initializeAnalytics()
		}
	}

	// private initializeAnalytics() {
	// 	// TODO: Initialize analytics service (Google Analytics, Mixpanel, etc.)
	// 	if (this.config.debug) {
	// 		console.log('Analytics initialized')
	// 	}
	// }

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
			// TODO: Send to analytics service
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
			// TODO: Send to analytics service
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
			// TODO: Send to analytics service
			this.queue.push({ type: 'page', data })
		}
	}

	trackInteraction(element: string, action: string, properties?: EventProperties) {
		this.track(`${element}_${action}`, {
			element,
			action,
			...properties,
		})
	}

	getQueue() {
		return this.queue
	}

	clearQueue() {
		this.queue = []
	}
}

const analytics = new Analytics()

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

export const ANALYTICS_EVENTS = {
	LOGIN_SUCCESS: 'login_success',
	LOGIN_FAILED: 'login_failed',
	LOGOUT: 'logout',

	PAGE_VIEW: 'page_view',
	LANGUAGE_CHANGED: 'language_changed',

	ANIMAL_CREATED: 'animal_created',
	ANIMAL_UPDATED: 'animal_updated',
	ANIMAL_DELETED: 'animal_deleted',
	ANIMAL_VIEWED: 'animal_viewed',

	EMPLOYEE_CREATED: 'employee_created',
	EMPLOYEE_UPDATED: 'employee_updated',
	EMPLOYEE_DELETED: 'employee_deleted',

	TASK_CREATED: 'task_created',
	TASK_COMPLETED: 'task_completed',
	TASK_UPDATED: 'task_updated',

	HEALTH_RECORD_CREATED: 'health_record_created',
	HEALTH_RECORD_UPDATED: 'health_record_updated',

	PRODUCTION_RECORD_CREATED: 'production_record_created',
	PRODUCTION_RECORD_UPDATED: 'production_record_updated',

	ERROR_OCCURRED: 'error_occurred',
	NETWORK_ERROR: 'network_error',

	OFFLINE_MODE_ENABLED: 'offline_mode_enabled',
	OFFLINE_QUEUE_PROCESSED: 'offline_queue_processed',
} as const

export default analytics
