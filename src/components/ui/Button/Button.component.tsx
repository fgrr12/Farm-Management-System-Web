import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'

import { useAppStore } from '@/store/useAppStore'

import type { ButtonProps } from './Button.types'

export const Button: FC<ButtonProps> = ({ children, ...props }) => {
	const btnRef = useRef<HTMLButtonElement>(null)
	const { loading } = useAppStore()

	useGSAP(() => {
		if (!loading && btnRef.current) {
			gsap.fromTo(
				btnRef.current,
				{ y: 20, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
			)
		}
	}, [loading])

	const handleMouseEnter = () => {
		if (btnRef.current) {
			gsap.to(btnRef.current, { scale: 1.02, duration: 0.2, ease: 'power1.out' })
		}
	}

	const handleMouseLeave = () => {
		if (btnRef.current) {
			gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power1.out' })
		}
	}

	return (
		<button
			ref={btnRef}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className="btn btn-primary h-12 w-full text-lg"
			{...props}
		>
			{children}
		</button>
	)
}

export const BackButton: FC<ButtonProps> = (props) => {
	const btnRef = useRef<HTMLButtonElement>(null)
	const { loading } = useAppStore()

	useGSAP(() => {
		if (!loading && btnRef.current) {
			gsap.fromTo(
				btnRef.current,
				{ x: -30, opacity: 0 },
				{ x: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.2 }
			)
		}
	}, [loading])

	const handleMouseEnter = () => {
		if (btnRef.current) {
			gsap.to(btnRef.current, { scale: 1.1, duration: 0.2, ease: 'power1.out' })
		}
	}

	const handleMouseLeave = () => {
		if (btnRef.current) {
			gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power1.out' })
		}
	}

	return (
		<button
			ref={btnRef}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className="btn bg-transparent border-none shadow-none hidden md:inline"
			{...props}
		>
			<i className="i-material-symbols-arrow-left-alt-rounded w-14! h-8!" />
		</button>
	)
}
