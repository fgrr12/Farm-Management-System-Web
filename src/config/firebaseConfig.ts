import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getMessaging } from 'firebase/messaging'
import { getStorage } from 'firebase/storage'

import {
	VITE_API_KEY,
	VITE_APP_ID,
	VITE_AUTH_DOMAIN,
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
