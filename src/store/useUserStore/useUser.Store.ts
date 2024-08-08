import { auth } from '@/config/environment'
import { create } from 'zustand'
import type { UserStore, UserStoreActions } from './useUser.types'

export const useUserStore = create<UserStore & UserStoreActions>((set) => ({
	user: {
		email: auth.currentUser?.email,
		name: auth.currentUser?.displayName,
		photoUrl: auth.currentUser?.photoURL,
		uuid: auth.currentUser?.uid,
		language: auth.languageCode,
	},
	setUser: (user) => set({ user }),
}))
