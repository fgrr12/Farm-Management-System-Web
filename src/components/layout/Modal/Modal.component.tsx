import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
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
					className="modal-backdrop bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-all duration-300"
					onClick={handleBackdropClick}
				/>
				<div
					ref={contentRef}
					className={modalClasses}
					{...touchHandlers}
					style={{
						transform: 'translateZ(0)',
						willChange: 'transform, opacity',
					}}
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
									className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
									aria-label={t('modal.close')}
								>
									<i className="i-material-symbols-close w-5! h-5! bg-white! transition-transform duration-200 hover:rotate-90" />
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

	// Enhanced animations with smoother backdrop
	useGSAP(() => {
		if (!modalRef.current || !backdropRef.current || !contentRef.current) return

		let timeline: gsap.core.Timeline | null = null

		if (open) {
			// Smoother entrance animation
			gsap.set(backdropRef.current, { opacity: 0, backdropFilter: 'blur(0px)' })
			gsap.set(contentRef.current, { scale: 0.9, opacity: 0, y: 30, rotationX: -10 })

			timeline = gsap.timeline()
			timeline.to(backdropRef.current, {
				opacity: 1,
				backdropFilter: 'blur(4px)',
				duration: 0.4,
				ease: 'power2.out',
			})
			timeline.to(
				contentRef.current,
				{
					scale: 1,
					opacity: 1,
					y: 0,
					rotationX: 0,
					duration: 0.5,
					ease: 'back.out(1.4)',
				},
				'-=0.2'
			)
		} else {
			// Smoother exit animation
			if (backdropRef.current && contentRef.current) {
				timeline = gsap.timeline()
				timeline.to(contentRef.current, {
					scale: 0.9,
					opacity: 0,
					y: -20,
					rotationX: 10,
					duration: 0.3,
					ease: 'power2.in',
				})
				timeline.to(
					backdropRef.current,
					{
						opacity: 0,
						backdropFilter: 'blur(0px)',
						duration: 0.3,
						ease: 'power2.in',
					},
					'-=0.1'
				)
			}
		}

		return () => {
			// Kill the timeline and all animations
			if (timeline) {
				timeline.kill()
			}
			// Kill any remaining tweens on modal elements
			gsap.killTweensOf([backdropRef.current, contentRef.current])
		}
	}, [open])

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

			// Only allow downward swipe to close
			if (deltaY > 0) {
				const progress = Math.min(deltaY / 200, 1) // 200px to fully close

				// Kill any existing animations before setting new values
				gsap.killTweensOf(contentRef.current)
				gsap.set(contentRef.current, {
					y: deltaY * 0.5, // Reduced movement for better feel
					scale: 1 - progress * 0.1,
					opacity: 1 - progress * 0.3,
				})

				if (backdropRef.current) {
					gsap.killTweensOf(backdropRef.current)
					gsap.set(backdropRef.current, {
						opacity: 1 - progress * 0.5,
					})
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
			// Threshold to close
			// Kill any existing animations before starting close animation
			gsap.killTweensOf([contentRef.current, backdropRef.current])

			// Close modal
			const tl = gsap.timeline()
			tl.to(contentRef.current, {
				y: 300,
				scale: 0.8,
				opacity: 0,
				duration: 0.3,
				ease: 'power2.in',
			})
			if (backdropRef.current) {
				tl.to(
					backdropRef.current,
					{
						opacity: 0,
						duration: 0.3,
						ease: 'power2.in',
					},
					'-=0.1'
				)
			}

			// Trigger close after animation
			setTimeout(() => {
				modalRef.current?.close()
				document.body.style.overflow = 'unset'
			}, 300)
		} else {
			// Kill any existing animations before snapping back
			gsap.killTweensOf([contentRef.current, backdropRef.current])

			// Snap back to original position
			gsap.to(contentRef.current, {
				y: 0,
				scale: 1,
				opacity: 1,
				duration: 0.3,
				ease: 'back.out(1.7)',
			})
			if (backdropRef.current) {
				gsap.to(backdropRef.current, {
					opacity: 1,
					duration: 0.3,
					ease: 'power2.out',
				})
			}
		}
	}, [isDragging, currentY, startY])

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
			}, 400)
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
