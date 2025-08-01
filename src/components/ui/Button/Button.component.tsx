import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type FC, memo, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppStore } from '@/store/useAppStore'

import type { BackButtonProps, ButtonProps } from './Button.types'

export const Button: FC<ButtonProps> = memo(
	({
		children,
		variant = 'primary',
		size = 'md',
		loading: propLoading,
		loadingText,
		leftIcon,
		rightIcon,
		fullWidth = true,
		disabled,
		className,
		...props
	}) => {
		const btnRef = useRef<HTMLButtonElement>(null)
		const { loading: globalLoading } = useAppStore()

		const isLoading = propLoading || globalLoading
		const isDisabled = disabled || isLoading

		const buttonClasses = useMemo(() => {
			const baseClasses =
				'btn transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2'

			const variantClasses = {
				primary:
					'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl focus:ring-blue-500 dark:focus:ring-blue-400',
				secondary:
					'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md focus:ring-gray-500 dark:focus:ring-gray-400',
				danger:
					'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 text-white border-none shadow-lg hover:shadow-xl focus:ring-red-500 dark:focus:ring-red-400',
				ghost:
					'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-none shadow-none focus:ring-gray-500 dark:focus:ring-gray-400',
				outline:
					'bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 hover:border-blue-700 dark:hover:border-blue-300 shadow-sm hover:shadow-md focus:ring-blue-500 dark:focus:ring-blue-400',
			}

			const sizeClasses = {
				sm: 'h-9 px-3 text-sm',
				md: 'h-12 px-6 text-base',
				lg: 'h-14 px-8 text-lg',
			}

			const widthClass = fullWidth ? 'w-full' : 'w-auto'
			const disabledClass = isDisabled ? 'opacity-60 cursor-not-allowed' : ''

			return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className || ''}`
		}, [variant, size, fullWidth, isDisabled, className])

		useGSAP(() => {
			if (!globalLoading && btnRef.current) {
				const animation = gsap.fromTo(
					btnRef.current,
					{ y: 20, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
				)

				return () => {
					// Kill the animation if component unmounts
					if (animation) {
						animation.kill()
					}
					// Kill any remaining tweens on this element
					gsap.killTweensOf(btnRef.current)
				}
			}
		}, [globalLoading])

		const handleMouseEnter = useCallback(() => {
			if (btnRef.current && !isDisabled) {
				// Kill any existing scale animations before starting new one
				gsap.killTweensOf(btnRef.current, 'scale')
				gsap.to(btnRef.current, { scale: 1.02, duration: 0.2, ease: 'power1.out' })
			}
		}, [isDisabled])

		const handleMouseLeave = useCallback(() => {
			if (btnRef.current && !isDisabled) {
				// Kill any existing scale animations before starting new one
				gsap.killTweensOf(btnRef.current, 'scale')
				gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power1.out' })
			}
		}, [isDisabled])

		const renderContent = () => {
			if (isLoading) {
				return (
					<div className="flex items-center justify-center gap-2">
						<span className="loading loading-spinner loading-sm" />
						{loadingText && <span>{loadingText}</span>}
					</div>
				)
			}

			return (
				<div className="flex items-center justify-center gap-2">
					{leftIcon && <i className={`${leftIcon} w-5! h-5!`} />}
					{children}
					{rightIcon && <i className={`${rightIcon} w-5! h-5!`} />}
				</div>
			)
		}

		return (
			<button
				ref={btnRef}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				className={buttonClasses}
				disabled={isDisabled}
				{...props}
			>
				{renderContent()}
			</button>
		)
	}
)

export const BackButton: FC<BackButtonProps> = memo((props) => {
	const btnRef = useRef<HTMLButtonElement>(null)
	const { loading } = useAppStore()
	const { t } = useTranslation('common')

	useGSAP(() => {
		if (!loading && btnRef.current) {
			const animation = gsap.fromTo(
				btnRef.current,
				{ x: -30, opacity: 0 },
				{ x: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.2 }
			)

			return () => {
				// Kill the animation if component unmounts
				if (animation) {
					animation.kill()
				}
				// Kill any remaining tweens on this element
				gsap.killTweensOf(btnRef.current)
			}
		}
	}, [loading])

	const handleMouseEnter = useCallback(() => {
		if (btnRef.current) {
			// Kill any existing scale animations before starting new one
			gsap.killTweensOf(btnRef.current, 'scale')
			gsap.to(btnRef.current, { scale: 1.05, duration: 0.2, ease: 'power1.out' })
		}
	}, [])

	const handleMouseLeave = useCallback(() => {
		if (btnRef.current) {
			// Kill any existing scale animations before starting new one
			gsap.killTweensOf(btnRef.current, 'scale')
			gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power1.out' })
		}
	}, [])

	return (
		<button
			ref={btnRef}
			type="button"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className="items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hidden md:inline-flex ml-4 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
			aria-label={t('header.back')}
			{...props}
		>
			<i className="i-material-symbols-arrow-left-alt-rounded w-5! h-5! bg-current!" />
			<span className="text-sm font-medium">{t('header.back')}</span>
		</button>
	)
})
