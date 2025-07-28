import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { FC } from 'react'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
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
		const { modalRef, backdropRef, contentRef } = useModal(open)

		const modalClasses = useMemo(() => {
			const sizeClasses = {
				sm: 'max-w-md',
				md: 'max-w-lg',
				lg: 'max-w-2xl',
				xl: 'max-w-4xl',
			}

			const baseClasses =
				'modal-box relative bg-white rounded-2xl shadow-2xl border-0 p-0 overflow-hidden'

			return `${baseClasses} ${sizeClasses[size]} ${className || ''}`
		}, [size, className])

		const variantConfig = useMemo(() => {
			const configs = {
				default: {
					headerBg: 'bg-gradient-to-r from-blue-600 to-blue-700',
					icon: 'i-material-symbols-info',
					iconColor: 'bg-white!',
				},
				danger: {
					headerBg: 'bg-gradient-to-r from-red-600 to-red-700',
					icon: 'i-material-symbols-warning',
					iconColor: 'bg-white!',
				},
				success: {
					headerBg: 'bg-gradient-to-r from-green-600 to-green-700',
					icon: 'i-material-symbols-check-circle',
					iconColor: 'bg-white!',
				},
				warning: {
					headerBg: 'bg-gradient-to-r from-yellow-600 to-orange-600',
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
					className="modal-backdrop bg-black/50"
					onClick={handleBackdropClick}
				/>
				<div ref={contentRef} className={modalClasses}>
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
									className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
									aria-label={t('modal.close')}
								>
									<i className="i-material-symbols-close w-5! h-5! bg-white!" />
								</button>
							)}
						</div>
					)}

					{/* Content */}
					<div className="px-6 py-6">
						{message && (
							<p className="text-gray-700 leading-relaxed mb-4" id="modal-description">
								{message}
							</p>
						)}
						{children}
					</div>

					{/* Actions */}
					{(onAccept || onCancel) && (
						<div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
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

	useGSAP(() => {
		if (!modalRef.current || !backdropRef.current || !contentRef.current) return

		if (open) {
			// Entrance animation
			gsap.set(backdropRef.current, { opacity: 0 })
			gsap.set(contentRef.current, { scale: 0.8, opacity: 0, y: 50 })

			const tl = gsap.timeline()
			tl.to(backdropRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
			tl.to(
				contentRef.current,
				{
					scale: 1,
					opacity: 1,
					y: 0,
					duration: 0.4,
					ease: 'back.out(1.7)',
				},
				'-=0.1'
			)
		} else {
			// Exit animation
			if (backdropRef.current && contentRef.current) {
				const tl = gsap.timeline()
				tl.to(contentRef.current, {
					scale: 0.8,
					opacity: 0,
					y: -30,
					duration: 0.3,
					ease: 'power2.in',
				})
				tl.to(backdropRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.1')
			}
		}
	}, [open])

	useEffect(() => {
		if (!modalRef.current) return

		if (open) {
			modalRef.current.showModal()
			// Prevent body scroll
			document.body.style.overflow = 'hidden'
		} else {
			// Small delay to allow exit animation
			setTimeout(() => {
				modalRef.current?.close()
				document.body.style.overflow = 'unset'
			}, 500)
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [open])

	return { modalRef, backdropRef, contentRef }
}
