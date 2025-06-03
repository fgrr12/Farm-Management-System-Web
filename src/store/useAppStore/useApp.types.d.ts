export interface AppStore {
	loading: boolean
	toastData: AppToastData | null
	defaultModalData: AppModalData
	headerTitle: string
}

export interface AppStoreActions {
	setLoading: (loading: boolean) => void
	setToastData: (data: AppToastData) => void
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

export interface AppToastData {
	message: string
	type?: 'success' | 'error' | 'info' | 'warning'
}
