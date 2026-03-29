import type { FC } from 'react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'

import type { ConfirmModalProps, ModalProps } from './Modal.types'

export const Modal: FC<ModalProps> = memo(
	({
		title,
		message,
		children,
		open,
		size = 'md',
		variant = 'default',
		showCloseButton = true,
		closeOnBackdrop = true,
		onAccept,
		onCancel,
		acceptText,
		cancelText,
		acceptVariant = 'primary',
		loading = false,
		loadingText,
		className,
		...rest
	}) => {
		const { t } = useTranslation('common')
		const { modalRef, backdropRef, contentRef, touchHandlers } = useModal(open)

		const modalClasses = useMemo(() => {
			const sizeClasses = {
				sm: 'max-w-md',
				md: 'max-w-lg',
				lg: 'max-w-2xl',
				xl: 'max-w-4xl',
			}

			const baseClasses =
				'modal-box relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-0 p-0 overflow-hidden transition-all duration-300'

			return `${baseClasses} ${sizeClasses[size]} ${className || ''}`
		}, [size, className])

		const variantConfig = useMemo(() => {
			const configs = {
				default: {
					headerBg: 'bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600',
					icon: 'i-material-symbols-info',
					iconColor: 'bg-white!',
				},
				danger: {
					headerBg: 'bg-linear-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600',
					icon: 'i-material-symbols-warning',
					iconColor: 'bg-white!',
				},
				success: {
					headerBg:
						'bg-linear-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600',
					icon: 'i-material-symbols-check-circle',
					iconColor: 'bg-white!',
				},
				warning: {
					headerBg:
						'bg-linear-to-r from-yellow-600 to-orange-600 dark:from-yellow-500 dark:to-orange-500',
					icon: 'i-material-symbols-warning',
					iconColor: 'bg-white!',
				},
			}
			return configs[variant]
		}, [variant])

		const handleBackdropClick = useCallback(() => {
			if (closeOnBackdrop && !loading) {
				onCancel ? onCancel() : onAccept?.()
			}
		}, [closeOnBackdrop, loading, onCancel, onAccept])

		const handleAccept = useCallback(() => {
			if (!loading) {
				onAccept?.()
			}
		}, [loading, onAccept])

		const handleCancel = useCallback(() => {
			if (!loading) {
				onCancel?.()
			}
		}, [loading, onCancel])

		return (
			<dialog className="modal" ref={modalRef} aria-modal="true" {...rest}>
				<div
					role="dialog"
					ref={backdropRef}
					className={`modal-backdrop bg-black/50 dark:bg-black/70 backdrop-blur-sm ${open ? 'animate-modal-backdrop-in' : 'animate-modal-backdrop-out'}`}
					onClick={handleBackdropClick}
				/>
				<div
					ref={contentRef}
					className={`${modalClasses} ${open ? 'animate-modal-content-in' : 'animate-modal-content-out'}`}
					{...touchHandlers}
				>
					{/* Header */}
					{title && (
						<div className={`${variantConfig.headerBg} px-6 py-4 text-white relative`}>
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
									<i className={`${variantConfig.icon} w-5! h-5! ${variantConfig.iconColor}`} />
								</div>
								<h3 className="text-lg font-bold" id="modal-title">
									{title}
								</h3>
							</div>

							{/* Close Button */}
							{showCloseButton && (
								<button
									type="button"
									onClick={handleCancel}
									disabled={loading}
									className="absolute top-2 right-2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
									aria-label={t('modal.close')}
								>
									<i className="i-material-symbols-close w-6! h-6! bg-white! transition-transform duration-200 hover:rotate-90" />
								</button>
							)}
						</div>
					)}

					{/* Content */}
					<div className="px-6 py-6">
						{message && (
							<p
								className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
								id="modal-description"
							>
								{message}
							</p>
						)}
						{children}
					</div>

					{/* Actions */}
					{(onAccept || onCancel) && (
						<div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 flex justify-end gap-3">
							{onCancel && (
								<Button
									variant="secondary"
									size="md"
									fullWidth={false}
									onClick={handleCancel}
									disabled={loading}
								>
									{cancelText || t('modal.cancel')}
								</Button>
							)}
							{onAccept && (
								<Button
									variant={acceptVariant}
									size="md"
									fullWidth={false}
									onClick={handleAccept}
									loading={loading}
									loadingText={loadingText}
								>
									{acceptText || t('modal.accept')}
								</Button>
							)}
						</div>
					)}
				</div>
			</dialog>
		)
	}
)

// Specialized Confirm Modal
export const ConfirmModal: FC<ConfirmModalProps> = memo((props) => {
	return (
		<Modal
			variant="danger"
			acceptVariant="danger"
			acceptText={props.acceptText || 'Delete'}
			cancelText={props.cancelText || 'Cancel'}
			{...props}
		/>
	)
})

const useModal = (open?: boolean) => {
	const modalRef = useRef<HTMLDialogElement>(null)
	const backdropRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [startY, setStartY] = useState(0)
	const [currentY, setCurrentY] = useState(0)

	// Touch/swipe gestures for mobile
	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		setIsDragging(true)
		setStartY(e.touches[0].clientY)
		setCurrentY(e.touches[0].clientY)
	}, [])

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!isDragging || !contentRef.current) return

			const touchY = e.touches[0].clientY
			const deltaY = touchY - startY
			setCurrentY(touchY)

			if (deltaY > 0) {
				const progress = Math.min(deltaY / 200, 1)
				contentRef.current.style.transform = `translateY(${deltaY * 0.5}px) scale(${1 - progress * 0.1})`
				contentRef.current.style.opacity = `${1 - progress * 0.3}`

				if (backdropRef.current) {
					backdropRef.current.style.opacity = `${1 - progress * 0.5}`
				}
			}
		},
		[isDragging, startY]
	)

	const handleTouchEnd = useCallback(() => {
		if (!isDragging || !contentRef.current) return

		const deltaY = currentY - startY
		setIsDragging(false)

		if (deltaY > 100) {
			contentRef.current.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in'
			contentRef.current.style.transform = 'translateY(300px) scale(0.8)'
			contentRef.current.style.opacity = '0'

			if (backdropRef.current) {
				backdropRef.current.style.transition = 'opacity 0.3s ease-in'
				backdropRef.current.style.opacity = '0'
			}

			setTimeout(() => {
				modalRef.current?.close()
				document.body.style.overflow = 'unset'
			}, 300)
		} else {
			contentRef.current.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out'
			contentRef.current.style.transform = ''
			contentRef.current.style.opacity = '1'

			if (backdropRef.current) {
				backdropRef.current.style.transition = 'opacity 0.3s ease-out'
				backdropRef.current.style.opacity = '1'
			}
		}
	}, [isDragging, currentY, startY])

	useEffect(() => {
		if (!modalRef.current) return

		if (open) {
			modalRef.current.showModal()
			document.body.style.overflow = 'hidden'

			// Reset inline styles from touch gestures so CSS animations can play
			if (contentRef.current) {
				contentRef.current.style.transition = ''
				contentRef.current.style.transform = ''
				contentRef.current.style.opacity = ''
			}
			if (backdropRef.current) {
				backdropRef.current.style.transition = ''
				backdropRef.current.style.opacity = ''
			}
		} else {
			setTimeout(() => {
				modalRef.current?.close()
				document.body.style.overflow = 'unset'
			}, 350)
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [open])

	return {
		modalRef,
		backdropRef,
		contentRef,
		touchHandlers: {
			onTouchStart: handleTouchStart,
			onTouchMove: handleTouchMove,
			onTouchEnd: handleTouchEnd,
		},
	}
}
