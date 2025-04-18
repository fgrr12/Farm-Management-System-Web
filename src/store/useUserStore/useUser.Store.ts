import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { UserStore } from './useUser.types'

export const useUserStore = create<UserStore>()(
	persist<UserStore>(
		(set) => ({
			user: null,
			setUser: (user) => set({ user }),
		}),
		{
			name: 'user-storage',
			storage: createJSONStorage(() => sessionStorage),
		}
	)
)
