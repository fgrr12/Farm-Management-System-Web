import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { getMessaging } from 'firebase/messaging'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

import {
	isLocalDevelopment,
	useEmulators,
	VITE_API_KEY,
	VITE_APP_ID,
	VITE_AUTH_DOMAIN,
	VITE_FUNCTIONS_EMULATOR_URL,
	VITE_MESSAGING_SENDER_ID,
	VITE_PROJECT_ID,
	VITE_STORAGE_BUCKET,
} from './environment'

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
