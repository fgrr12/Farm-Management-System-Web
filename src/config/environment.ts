export const {
	VITE_API_KEY,
	VITE_AUTH_DOMAIN,
	VITE_PROJECT_ID,
	VITE_STORAGE_BUCKET,
	VITE_MESSAGING_SENDER_ID,
	VITE_APP_ID,
	VITE_MEASUREMENT_ID,
	VITE_FIREBASE_CONFIG,
	VITE_FIREBASE_VAPID_KEY,
	VITE_USE_EMULATORS,
	VITE_USE_FUNCTIONS_EMULATOR,
	VITE_FUNCTIONS_EMULATOR_URL,
} = import.meta.env

export const isDevelopment =
	import.meta.env.MODE === 'develop' || import.meta.env.MODE === 'local-develop'
export const isProduction = import.meta.env.MODE === 'production'
export const isLocalDevelopment = import.meta.env.MODE === 'local-develop'
export const currentEnvironment = import.meta.env.MODE
export const useEmulators = VITE_USE_EMULATORS === 'true'
/**
 * Run only Cloud Functions against the local emulator while Auth, Firestore and
 * Storage keep talking to the real project. Useful for iterating on the backend
 * with real data, which is what `.env.develop` documents this flag for.
 */
export const useFunctionsEmulator = VITE_USE_FUNCTIONS_EMULATOR === 'true'
