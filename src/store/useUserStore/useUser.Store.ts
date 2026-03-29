import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { UserStore } from './useUser.types'

export const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			user: null,
			authLoading: true,
			setUser: (user) => set({ user }),
			setAuthLoading: (authLoading) => set({ authLoading }),
		}),
		{
			name: 'user-storage',
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({ user: state.user }) as UserStore,
		}
	)
)
