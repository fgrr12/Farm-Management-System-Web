import { create } from 'zustand'

interface NotificationStore {
	notifications: NotificationData[]
	unreadCount: number
	loading: boolean
	error: string | null

	// Actions
	setNotifications: (notifications: NotificationData[]) => void
	setUnreadCount: (count: number) => void
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void
	reset: () => void
}

const initialState = {
	notifications: [],
	unreadCount: 0,
	loading: false,
	error: null,
}

export const useNotificationStore = create<NotificationStore>((set) => ({
	...initialState,

	setNotifications: (notifications) => set({ notifications, loading: false }),
	setUnreadCount: (unreadCount) => set({ unreadCount }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error, loading: false }),
	reset: () => set(initialState),
}))
