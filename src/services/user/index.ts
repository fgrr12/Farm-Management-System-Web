import { auth, firestore } from '@/config/environment'
import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithEmailAndPassword,
	signInWithPopup,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { UserCredentials } from './types'

const collectionName = 'users'
const SPANISH = 'spa'

export module UserService {
	export const registerUser = async ({ email, password }: UserCredentials) => {
		const result = await createUserWithEmailAndPassword(auth, email, password)
		const { user } = result
		const userDocument = doc(firestore, collectionName, user.uid)
		setDoc(userDocument, {
			uuid: user.uid,
			email: user.email,
			photoUrl: user.photoURL,
			language: SPANISH,
		})
	}

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
		setDoc(userDocument, {
			uuid: user.uid,
			email: user.email,
			name: user.displayName,
			photoUrl: user.photoURL,
			language: SPANISH,
		})
	}

	export const getUser = async (uuid: string) => {
		const userDocument = doc(firestore, collectionName, uuid)
		const userDoc = await getDoc(userDocument)
		return userDoc.data()
	}

	export const logout = async () => {
		await auth.signOut()
	}
}
