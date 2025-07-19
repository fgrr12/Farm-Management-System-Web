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
			className="fixed top-18 right-0 sm:right-4 space-y-2 z-50 w-full max-w-sm flex flex-col justify-end items-center"
			role="region"
			aria-label="Notifications"
		>
			{toasts.map((toast) => (
				<Toast key={toast.id} {...toast} onClose={removeToast} />
			))}
		</div>
	)
}
