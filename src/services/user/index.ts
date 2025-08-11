import {
	deleteUser,
	GoogleAuthProvider,
	signInWithEmailAndPassword,
	signInWithPopup,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import { auth, firestore } from '@/config/firebaseConfig'

import { callableFireFunction } from '@/utils/callableFireFunction'

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
		deleteUser(user)
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

const updateUser = async (user: User, userUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: User }>('auth', {
		operation: 'updateUserProfile',
		userProfile: user,
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
