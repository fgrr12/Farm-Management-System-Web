export const {
	VITE_API_KEY,
	VITE_AUTH_DOMAIN,
	VITE_PROJECT_ID,
	VITE_STORAGE_BUCKET,
	VITE_MESSAGING_SENDER_ID,
	VITE_APP_ID,
	VITE_MEASUREMENT_ID,
	VITE_FIREBASE_CONFIG,
} = import.meta.env

export const isDevelopment =
	import.meta.env.MODE === 'development' || import.meta.env.MODE === 'local-develop'
export const isProduction = import.meta.env.MODE === 'production'
export const currentEnvironment = import.meta.env.MODE
