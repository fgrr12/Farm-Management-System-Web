import { useCallback, useEffect, useState } from 'react'

import { useAppStore } from '@/store/useAppStore'

import { Toast } from '@/components/ui/Toast'

import type { ToastItem } from './ToastManager.types'

export const ToastManager = () => {
	const { toastData } = useAppStore()
	const [toasts, setToasts] = useState<ToastItem[]>([])

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id))
	}, [])

	useEffect(() => {
		if (!toastData) return
		setToasts((prev) => [...prev, { ...toastData, id: crypto.randomUUID() }])
	}, [toastData])

	return (
		<div
			className="fixed top-20 right-4 space-y-3 z-50 w-full max-w-sm flex flex-col pointer-events-none"
			role="region"
			aria-label="Notifications"
		>
			{toasts.map((toast) => (
				<div key={toast.id} className="pointer-events-auto">
					<Toast {...toast} onClose={removeToast} />
				</div>
			))}
		</div>
	)
}
