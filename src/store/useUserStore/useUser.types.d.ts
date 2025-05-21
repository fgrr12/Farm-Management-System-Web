import type { PersistOptions } from 'zustand/middleware'

type UserStore = {
	user: User | null
	setUser: (user: User | null) => void
}
// biome-ignore lint: unused import
type MyPersist = (
	config: (set: any) => UserStore,
	options: PersistOptions<UserStore>
) => (set: any) => UserStore
