import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { getMessaging } from 'firebase/messaging'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

import {
	isLocalDevelopment,
	useEmulators,
	useFunctionsEmulator,
	VITE_API_KEY,
	VITE_APP_ID,
	VITE_AUTH_DOMAIN,
	VITE_FUNCTIONS_EMULATOR_URL,
	VITE_MESSAGING_SENDER_ID,
	VITE_PROJECT_ID,
	VITE_STORAGE_BUCKET,
} from './environment'

/*
 * NOTE: authDomain deliberately stays on Firebase's own `<project>.firebaseapp.com`.
 *
 * Pointing it at our own host would make the sign-in popup same-origin (no COOP
 * warning, and redirect sign-in would stop depending on third-party cookies), and
 * Firebase Hosting does serve `/__/auth/**` for any site in the project. But the
 * handler URL doubles as the OAuth `redirect_uri`, and Google only has
 * `https://<project>.firebaseapp.com/__/auth/handler` registered on the project's
 * OAuth client. Switching the domain without also adding the new URI under
 * Google Cloud Console → Credentials → OAuth 2.0 Client ID → Authorized redirect
 * URIs breaks sign-in with `Error 400: redirect_uri_mismatch`.
 */
const firebaseConfig = {
	apiKey: VITE_API_KEY,
	authDomain: VITE_AUTH_DOMAIN,
	projectId: VITE_PROJECT_ID,
	storageBucket: VITE_STORAGE_BUCKET,
	messagingSenderId: VITE_MESSAGING_SENDER_ID,
	appId: VITE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const signUpApp = initializeApp(firebaseConfig, 'signUp')

const auth = getAuth(app)
const signUpAuth = getAuth(signUpApp)
const firestore = getFirestore(app)
const storage = getStorage(app)
const functions = getFunctions(app)

// Configure emulators for local development
if (useEmulators && isLocalDevelopment) {
	try {
		// Connect to Auth emulator
		connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })

		// Connect to Firestore emulator
		connectFirestoreEmulator(firestore, 'localhost', 8080)

		// Connect to Functions emulator
		if (VITE_FUNCTIONS_EMULATOR_URL) {
			const url = new URL(VITE_FUNCTIONS_EMULATOR_URL)
			connectFunctionsEmulator(functions, url.hostname, Number(url.port))
		}

		// Connect to Storage emulator
		connectStorageEmulator(storage, 'localhost', 9199)

		console.info('🔧 Firebase Emulators connected for local development')
	} catch (error) {
		console.warn('Firebase Emulators connection failed (may already be connected):', error)
	}
} else if (useFunctionsEmulator && VITE_FUNCTIONS_EMULATOR_URL) {
	// Functions only: Auth, Firestore and Storage stay on the real project. Without
	// this branch VITE_USE_FUNCTIONS_EMULATOR was dead config — the flag and URL were
	// documented in .env.develop but nothing read them, so every callable silently
	// went to the deployed functions instead of the local emulator.
	try {
		const url = new URL(VITE_FUNCTIONS_EMULATOR_URL)
		connectFunctionsEmulator(functions, url.hostname, Number(url.port))
		console.info(`🔧 Functions emulator connected at ${url.host} (other services are live)`)
	} catch (error) {
		console.warn('Functions emulator connection failed:', error)
	}
}

// Initialize messaging only in browsers that support it
let messaging: ReturnType<typeof getMessaging> | null = null
try {
	if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
		messaging = getMessaging(app)
	}
} catch (error) {
	console.warn('Firebase Messaging not supported in this environment:', error)
}

auth.settings.appVerificationDisabledForTesting = true

export { auth, firestore, functions, messaging, signUpAuth, storage }
