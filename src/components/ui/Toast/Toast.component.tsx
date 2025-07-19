import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

import type { ToastProps } from './Toast.types'

export const Toast = ({ id, message, type = 'info', duration = 5000, onClose }: ToastProps) => {
	const toastRef = useRef<HTMLDivElement>(null)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	useGSAP(() => {
		const el = toastRef.current
		if (!el) return
		el.style.opacity = '0'

		gsap.to(el, {
			x: 0,
			opacity: 1,
			duration: 0.6,
			ease: 'power3.out',
			onStart: () => {
				gsap.set(el, {
					x: window.innerWidth,
					scale: 0.95,
				})
			},
		})
	}, [])

	useEffect(() => {
		const el = toastRef.current
		if (!el) return

		timeoutRef.current = setTimeout(() => {
			gsap.to(el, {
				x: window.innerWidth,
				opacity: 0,
				scale: 0.95,
				duration: 0.5,
				ease: 'power2.in',
				onComplete: () => onClose(id),
			})
		}, duration)

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [duration, id, onClose])

	return (
		<div
			ref={toastRef}
			className={`alert alert-${type} shadow-lg transition-all w-full max-w-[90%] sm:max-w-100`}
			role="alert"
			aria-live="polite"
		>
			<span>{message}</span>
		</div>
	)
}
