import type { User } from '@/types'

export type UserStore = {
	user: User | null
	authLoading: boolean
	setUser: (user: User | null) => void
	setAuthLoading: (loading: boolean) => void
}
