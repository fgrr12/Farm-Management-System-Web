import { auth, firestore } from '@/config/environment'
import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithEmailAndPassword,
	signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import type { UserCredentials } from './types'

const collectionName = 'users'

export module UserService {
	export const registerUser = async ({ email, password }: UserCredentials, name: string) => {
		const result = await createUserWithEmailAndPassword(auth, email, password)
		const user = result.user
		const token = await user.getIdToken()
		sessionStorage.setItem('token', token)

		const userDocument = doc(firestore, collectionName, user.uid)
		setDoc(userDocument, {
			email: user.email,
			name,
			photo: user.photoURL,
		})
	}

	export const loginWithEmailAndPassword = async (email: string, password: string) => {
		const result = await signInWithEmailAndPassword(auth, email, password)
		const user = result.user
		const token = await user.getIdToken()
		sessionStorage.setItem('token', token)
	}

	export const loginWithGoogle = async () => {
		const provider = new GoogleAuthProvider()
		provider.addScope('profile')
		provider.addScope('email')
		const result = await signInWithPopup(auth, provider)
		const user = result.user

		const credential = GoogleAuthProvider.credentialFromResult(result)
		const token = credential?.accessToken

		sessionStorage.setItem('token', token!)

		const userDocument = doc(firestore, collectionName, user.uid)
		setDoc(userDocument, {
			email: user.email,
			name: user.displayName,
			photo: user.photoURL,
		})
	}

	export const logout = async () => {
		await auth.signOut()
		sessionStorage.removeItem('token')
	}
}
