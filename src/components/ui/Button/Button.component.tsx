import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { memo, useCallback, useMemo, useRef } from 'react'
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
					'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-none shadow-lg hover:shadow-xl focus:ring-blue-500',
				secondary:
					'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 border border-gray-300 shadow-sm hover:shadow-md focus:ring-gray-500',
				danger:
					'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-none shadow-lg hover:shadow-xl focus:ring-red-500',
				ghost:
					'bg-transparent hover:bg-gray-100 text-gray-700 border-none shadow-none focus:ring-gray-500',
				outline:
					'bg-transparent hover:bg-blue-50 text-blue-600 border-2 border-blue-600 hover:border-blue-700 shadow-sm hover:shadow-md focus:ring-blue-500',
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
				gsap.fromTo(
					btnRef.current,
					{ y: 20, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
				)
			}
		}, [globalLoading])

		const handleMouseEnter = useCallback(() => {
			if (btnRef.current && !isDisabled) {
				gsap.to(btnRef.current, { scale: 1.02, duration: 0.2, ease: 'power1.out' })
			}
		}, [isDisabled])

		const handleMouseLeave = useCallback(() => {
			if (btnRef.current && !isDisabled) {
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
			gsap.fromTo(
				btnRef.current,
				{ x: -30, opacity: 0 },
				{ x: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.2 }
			)
		}
	}, [loading])

	const handleMouseEnter = useCallback(() => {
		if (btnRef.current) {
			gsap.to(btnRef.current, { scale: 1.05, duration: 0.2, ease: 'power1.out' })
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
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className="items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 hidden md:inline-flex ml-4 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
			aria-label={t('header.back')}
			{...props}
		>
			<i className="i-material-symbols-arrow-left-alt-rounded w-5! h-5! bg-current!" />
			<span className="text-sm font-medium">{t('header.back')}</span>
		</button>
	)
})
