import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { FC } from 'react'
import { memo, useCallback, useRef } from 'react'

import { useAppStore } from '@/store/useAppStore'

import type { ActionButtonProps } from './ActionButton.types'

const iconColor = (icon: string | undefined) => {
	switch (icon) {
		case 'i-material-symbols-add-circle-outline':
			return 'bg-blue-500!'
		case 'i-material-symbols-delete-outline':
			return 'bg-red-500!'
		case 'i-material-symbols-light-health-metrics-rounded':
			return 'bg-emerald-500!'
		case 'i-icon-park-outline-milk':
			return 'bg-blue-500!'
		case 'i-tabler-circles-relation':
			return 'bg-yellow-500!'
		case 'i-lucide-circle-x':
		case 'i-material-symbols-event-busy-rounded':
			return 'bg-red-500!'
		case 'i-lineicons-xmark':
		case 'i-lineicons-microphone-1':
			return 'bg-white!'
		default:
			return ''
	}
}

export const ActionButton: FC<ActionButtonProps> = memo(({ icon, title, ...rest }) => {
	const btnRef = useRef<HTMLButtonElement>(null)
	const { loading } = useAppStore()

	useGSAP(() => {
		if (!loading && btnRef.current) {
			gsap.fromTo(
				btnRef.current,
				{ scale: 0.6, opacity: 0 },
				{ scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
			)
		}
	}, [loading])

	const handleMouseEnter = useCallback(() => {
		if (btnRef.current) {
			gsap.to(btnRef.current, { scale: 1.1, duration: 0.2, ease: 'power1.out' })
		}
	}, [])

	const handleMouseLeave = useCallback(() => {
		if (btnRef.current) {
			gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power1.out' })
		}
	}, [])

	return (
		<button
			ref={btnRef}
			type="button"
			className="btn btn-circle bg-transparent border-none shadow-none"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			aria-label={title}
			{...rest}
		>
			<i className={`${icon} h-8! w-8! ${rest.disabled ? 'bg-gray-400!' : iconColor(icon)}`} />
		</button>
	)
})
