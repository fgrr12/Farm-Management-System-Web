export interface AppStore {
	loading: boolean
	defaultModalData: AppModalData
	headerTitle: string
	collapseSidebar: boolean
	topHeaderHeight: number
}

export interface AppStoreActions {
	setLoading: (loading: boolean) => void
	setModalData: (data: AppModalData) => void
	setHeaderTitle: (title: string) => void
	setCollapseSidebar: (collapse: boolean) => void
	setTopHeaderHeight: (height: number) => void
}

export interface AppModalData {
	title: string
	message: string
	open: boolean
	onAccept?: () => void
	onCancel?: () => void
}
