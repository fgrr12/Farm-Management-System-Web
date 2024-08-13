import { create } from 'zustand'
import type { AppModalData, AppStore, AppStoreActions } from './useApp.types'

const DEFAULT_MODAL_DATA: AppModalData = {
	title: '',
	message: '',
	open: false,
}

export const useAppStore = create<AppStore & AppStoreActions>((set) => ({
	loading: false,
	defaultModalData: DEFAULT_MODAL_DATA,
	headerTitle: '',
	collapseSidebar: true,
	topHeaderHeight: 0,
	setLoading: (loading) => set({ loading }),
	setModalData: (modalData) => set({ defaultModalData: modalData }),
	setHeaderTitle: (title) => set({ headerTitle: title }),
	setCollapseSidebar: (collapse) => set({ collapseSidebar: collapse }),
	setTopHeaderHeight: (height) => set({ topHeaderHeight: height }),
}))

export const GENERIC_MODAL_DATA: AppModalData = {
	title: 'Error inesperado',
	message: 'Ha ocurrido un error inesperado, por favor intenta de nuevo.',
	open: true,
	onAccept: () => useAppStore.getState().setModalData(DEFAULT_MODAL_DATA),
}
