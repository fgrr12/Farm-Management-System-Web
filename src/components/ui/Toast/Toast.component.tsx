import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { ToastConfig, ToastProps } from './Toast.types'

export const Toast = memo(
	({
		id,
		message,
		type = 'info',
		duration = 5000,
		dismissible = true,
		action,
		onClose,
	}: ToastProps) => {
		const timeoutRef = useRef<NodeJS.Timeout | null>(null)
		const [isExiting, setIsExiting] = useState(false)

		const toastConfig = useMemo((): ToastConfig => {
			const configs = {
				success: {
					icon: 'i-material-symbols-check-circle',
					bgColor: 'bg-green-50 dark:bg-green-900/20',
					borderColor: 'border-green-200 dark:border-green-700',
					textColor: 'text-green-800 dark:text-green-200',
					iconColor: 'bg-green-500! dark:bg-green-400!',
				},
				error: {
					icon: 'i-material-symbols-error',
					bgColor: 'bg-red-50 dark:bg-red-900/20',
					borderColor: 'border-red-200 dark:border-red-700',
					textColor: 'text-red-800 dark:text-red-200',
					iconColor: 'bg-red-500! dark:bg-red-400!',
				},
				warning: {
					icon: 'i-material-symbols-warning',
					bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
					borderColor: 'border-yellow-200 dark:border-yellow-700',
					textColor: 'text-yellow-800 dark:text-yellow-200',
					iconColor: 'bg-yellow-500! dark:bg-yellow-400!',
				},
				info: {
					icon: 'i-material-symbols-info',
					bgColor: 'bg-blue-50 dark:bg-blue-900/20',
					borderColor: 'border-blue-200 dark:border-blue-700',
					textColor: 'text-blue-800 dark:text-blue-200',
					iconColor: 'bg-blue-500! dark:bg-blue-400!',
				},
			}
			return configs[type]
		}, [type])

		const handleClose = useCallback(() => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			setIsExiting(true)
			setTimeout(() => onClose(id), 400)
		}, [id, onClose])

		const handleActionClick = useCallback(() => {
			action?.onClick()
			handleClose()
		}, [action, handleClose])

		useEffect(() => {
			if (duration <= 0) return

			timeoutRef.current = setTimeout(() => {
				handleClose()
			}, duration)

			return () => {
				if (timeoutRef.current) clearTimeout(timeoutRef.current)
			}
		}, [duration, handleClose])

		return (
			<div
				className={`
					relative w-full max-w-sm
					${toastConfig.bgColor} ${toastConfig.borderColor} ${toastConfig.textColor}
					border rounded-xl shadow-2xl dark:shadow-3xl backdrop-blur-sm
					hover:scale-[1.02] transition-transform duration-200
					${isExiting ? 'animate-slide-right-out' : 'animate-slide-right-in'}
				`}
				role="alert"
				aria-live="polite"
			>
				{/* Progress Bar */}
				{duration > 0 && (
					<div className="absolute top-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-t-xl overflow-hidden">
						<div
							className={`h-full ${toastConfig.iconColor.replace('!', '').replace(' dark:bg-', ' dark:bg-')}`}
							style={{
								animation: `progress-shrink ${duration}ms linear 0.6s forwards`,
							}}
						/>
					</div>
				)}

				{/* Content */}
				<div className="p-4">
					<div className="flex items-start gap-3">
						{/* Icon */}
						<div className="shrink-0 mt-0.5">
							<i className={`${toastConfig.icon} w-5! h-5! ${toastConfig.iconColor}`} />
						</div>

						{/* Message */}
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium leading-relaxed">{message}</div>

							{/* Action Button */}
							{action && (
								<button
									type="button"
									onClick={handleActionClick}
									className={`
										mt-2 text-xs font-semibold underline hover:no-underline
										${toastConfig.textColor} opacity-80 hover:opacity-100
										transition-opacity duration-200
									`}
								>
									{action.label}
								</button>
							)}
						</div>

						{/* Close Button */}
						{dismissible && (
							<button
								type="button"
								onClick={handleClose}
								className={`
									shrink-0 min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-black/10 dark:hover:bg-white/10
									transition-colors duration-200 focus:outline-none 
									focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
								`}
								aria-label="Close notification"
							>
								<i className={`i-material-symbols-close w-5! h-5! ${toastConfig.iconColor}`} />
							</button>
						)}
					</div>
				</div>
			</div>
		)
	}
)

// Toast Container Component for managing multiple toasts
export const ToastContainer = memo(({ children }: { children: React.ReactNode }) => {
	return <div className="fixed inset-0 pointer-events-none z-50">{children}</div>
})
