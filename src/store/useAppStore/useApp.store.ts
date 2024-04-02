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
	isIOS:
		navigator.platform === 'iPad' ||
		navigator.platform === 'iPhone' ||
		navigator.platform === 'iPod',
	setLoading: (loading) => set({ loading }),
	setModalData: (modalData) => set({ defaultModalData: modalData }),
}))

export const GENERIC_MODAL_DATA: AppModalData = {
	title: 'Error inesperado',
	message: 'Ha ocurrido un error inesperado, por favor intenta de nuevo.',
	open: true,
	onAccept: () => useAppStore.getState().setModalData(DEFAULT_MODAL_DATA),
}
