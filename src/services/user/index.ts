import {
	deleteUser,
	GoogleAuthProvider,
	signInWithEmailAndPassword,
	signInWithPopup,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

import { auth, firestore } from '@/config/firebaseConfig'

const collectionName = 'users'

export const loginWithEmailAndPassword = async (email: string, password: string) => {
	await signInWithEmailAndPassword(auth, email, password)
}

export const loginWithGoogle = async () => {
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

export const getUser = async (uuid: string): Promise<User> => {
	const userDocument = doc(firestore, collectionName, uuid)
	const userDoc = await getDoc(userDocument)
	return userDoc.data() as User
}

export const updateUser = async (user: User) => {
	const userDocument = doc(firestore, collectionName, user.uuid)
	await setDoc(userDocument, user, { merge: true })
}

export const logout = async () => {
	await auth.signOut()
}

export const UserService = {
	loginWithEmailAndPassword,
	loginWithGoogle,
	getUser,
	updateUser,
	logout,
}
