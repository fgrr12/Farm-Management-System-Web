import { create } from 'zustand'
import type { UserStore, UserStoreActions } from './useUser.types'

export const useUserStore = create<UserStore & UserStoreActions>((set) => ({
	user: null,
	setUser: (user) => set({ user }),
}))
