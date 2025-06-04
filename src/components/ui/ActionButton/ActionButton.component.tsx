import gsap from 'gsap'
import { useEffect, useRef } from 'react'

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
			return 'bg-gray-500!'
		case 'i-tabler-circles-relation':
			return 'bg-yellow-500!'
		case 'i-lucide-circle-x':
			return 'bg-red-500!'
		default:
			return ''
	}
}

export const ActionButton: FC<ActionButtonProps> = ({ icon, ...rest }) => {
	const btnRef = useRef<HTMLButtonElement>(null)
	const { loading } = useAppStore()

	useEffect(() => {
		if (btnRef.current && !loading) {
			gsap.fromTo(
				btnRef.current,
				{ scale: 0.6, opacity: 0 },
				{
					scale: 1,
					opacity: 1,
					duration: 0.5,
					ease: 'back.out(1.7)',
				}
			)
		}
	}, [loading])

	const handleMouseEnter = () => {
		gsap.to(btnRef.current, { scale: 1.1, duration: 0.2, ease: 'power1.out' })
	}

	const handleMouseLeave = () => {
		gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power1.out' })
	}

	return (
		<button
			ref={btnRef}
			type="button"
			className="btn btn-circle bg-transparent border-none shadow-none"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			{...rest}
		>
			<i className={`${icon} h-7! w-7! ${rest.disabled ? 'bg-gray-400!' : iconColor(icon)}`} />
		</button>
	)
}
