export interface UserStore {
	user: User | null
}

export interface UserStoreActions {
	setUser: (user: User | null) => void
}
