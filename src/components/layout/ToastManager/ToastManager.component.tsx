import { useCallback, useEffect, useState } from 'react'

import { useAppStore } from '@/store/useAppStore'

import { Toast } from '@/components/ui/Toast'

import type { ToastItem } from './ToastManager.types'

export const ToastManager = () => {
	const { toastData } = useAppStore()
	const [toasts, setToasts] = useState<ToastItem[]>([])

	// const addToast = (toast: Omit<ToastItem, 'id'>) => {
	//     setToasts((prev) => [...prev, { ...toast, id: Math.random().toString() }])
	// }

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id))
	}, [])

	useEffect(() => {
		if (!toastData) return
		setToasts((prev) => [...prev, { ...toastData, id: crypto.randomUUID() }])
	}, [toastData])

	return (
		<>
			<div className="fixed top-4 right-4 space-y-2 z-50 w-full max-w-sm">
				{toasts.map((toast) => (
					<Toast key={toast.id} {...toast} onClose={removeToast} />
				))}
			</div>

			{/* Botón de prueba (opcional) */}
			{/* <div className="fixed bottom-4 right-4">
                <button
                    className="btn btn-primary"
                    onClick={() =>
                        addToast({
                            message: 'Nueva notificación',
                            type: 'success',
                            duration: 3000,
                        })
                    }
                >
                    Agregar Toast
                </button>
            </div> */}
		</>
	)
}
