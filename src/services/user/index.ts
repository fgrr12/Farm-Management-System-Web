import {
	deleteUser,
	GoogleAuthProvider,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import { auth, firestore } from '@/config/firebaseConfig'

import { callableFireFunction } from '@/utils/callableFireFunction'

import type { User } from '@/types'

const collectionName = 'users'

const loginWithEmailAndPassword = async (email: string, password: string) => {
	await signInWithEmailAndPassword(auth, email, password)
}

const loginWithGoogle = async () => {
	const provider = new GoogleAuthProvider()
	provider.addScope('profile')
	provider.addScope('email')
	const result = await signInWithPopup(auth, provider)
	const { user } = result
	const userDocument = doc(firestore, collectionName, user.uid)
	const userDoc = await getDoc(userDocument)

	if (!userDoc.exists()) {
		// Signing in with Google creates a Firebase Auth account even for people who
		// were never invited to a farm. Roll it back before returning — and make sure
		// no session survives, or onAuthStateChanged picks up a user with no document.
		try {
			await deleteUser(user)
		} catch (error) {
			console.error('Could not delete unregistered account, signing out instead:', error)
			await signOut(auth)
		}
		// Without this the caller treated an unauthorised login as a success and
		// navigated straight into the app.
		throw new Error('auth/user-not-registered')
	}
}

const getUser = async (userUuid: string): Promise<User> => {
	const response = await callableFireFunction<{ success: boolean; data: User }>('auth', {
		operation: 'getUserProfile',
		userUuid,
	})
	return response.data
}

const getUserSettings = async (userUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('auth', {
		operation: 'getUserSettings',
		userUuid,
	})
	return response.data
}

const updateUser = async (userData: User, userUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: User }>('auth', {
		operation: 'updateUserProfile',
		userData,
		userUuid,
	})
	return response.data
}

const trackUserLogin = async (userUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('auth', {
		operation: 'trackUserLogin',
		userUuid,
	})
	return response
}

const trackUserActivity = async (userUuid: string, activity: string) => {
	const response = await callableFireFunction<{ success: boolean }>('auth', {
		operation: 'trackUserActivity',
		userUuid,
		activity,
	})
	return response
}

const logout = async () => {
	await auth.signOut()
}

export const UserService = {
	loginWithEmailAndPassword,
	loginWithGoogle,
	getUser,
	getUserSettings,
	updateUser,
	trackUserLogin,
	trackUserActivity,
	logout,
}
