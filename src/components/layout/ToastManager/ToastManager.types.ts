export type ToastItem = {
	id: string
	message: string
	type?: 'success' | 'error' | 'info' | 'warning'
	duration?: number
}
