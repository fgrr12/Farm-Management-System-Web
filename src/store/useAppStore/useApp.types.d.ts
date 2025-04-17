export interface AppStore {
	loading: boolean
	defaultModalData: AppModalData
	headerTitle: string
}

export interface AppStoreActions {
	setLoading: (loading: boolean) => void
	setModalData: (data: AppModalData) => void
	setHeaderTitle: (title: string) => void
}

export interface AppModalData {
	title: string
	message: string
	open: boolean
	onAccept?: () => void
	onCancel?: () => void
}
