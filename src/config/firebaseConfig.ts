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

/**
 * Serve the OAuth handler from our own origin whenever we can.
 *
 * The default `<project>.firebaseapp.com` authDomain makes the sign-in popup
 * cross-origin, which costs us two things: Chrome reports COOP on the SDK's
 * `window.close()`, and `signInWithRedirect` ends up depending on third-party
 * cookies (blocked by Safari, increasingly by Chrome) where it fails silently.
 * Firebase Hosting serves `/__/auth/**` natively for any site in the project,
 * so pointing authDomain at our own host makes the whole flow same-origin.
 *
 * Only applies over https: the SDK always builds the handler URL as
 * `https://<authDomain>/__/auth/handler`, so a plain-http dev server would end
 * up requesting an https URL that does not exist. Local dev keeps Firebase's
 * own domain, and the auth emulator keeps it too since it serves its own widget.
 */
const resolveAuthDomain = () => {
	if (typeof window === 'undefined' || useEmulators) return VITE_AUTH_DOMAIN
	return window.location.protocol === 'https:' ? window.location.host : VITE_AUTH_DOMAIN
}

const firebaseConfig = {
	apiKey: VITE_API_KEY,
	authDomain: resolveAuthDomain(),
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
