import { auth, firestore } from '@/config/environment'
import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithEmailAndPassword,
	signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import type { UserCredentials } from './types'

export module UserService {
	export const loginWithEmailAndPassword = async (email: string, password: string) => {
		const user = await signInWithEmailAndPassword(auth, email, password)
		return user
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

		const userDocument = doc(firestore, 'users', user.uid)
		setDoc(userDocument, {
			email: user.email,
			name: user.displayName,
			photo: user.photoURL,
		})
	}
	export const registerUser = async ({ email, password }: UserCredentials, data: any) => {
		console.log(data)

		const user = await createUserWithEmailAndPassword(auth, email, password)
		return user
	}

	export const logout = async () => {
		await auth.signOut()
		sessionStorage.removeItem('token')
	}
}
