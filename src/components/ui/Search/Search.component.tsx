import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { memo, useCallback, useId, useRef } from 'react'

import type { SearchProps } from './Search.types'

export const Search: FC<SearchProps> = memo(
	({ placeholder, className, onFocus, onBlur, ...rest }) => {
		const fieldId = useId()
		const containerRef = useRef<HTMLDivElement>(null)
		const inputRef = useRef<HTMLInputElement>(null)

		useGSAP(() => {
			if (containerRef.current) {
				gsap.fromTo(
					containerRef.current,
					{ y: 10, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
				)
			}
		}, [])

		const handleFocus = useCallback(
			(e: React.FocusEvent<HTMLInputElement>) => {
				if (inputRef.current) {
					gsap.to(inputRef.current.parentElement, {
						scale: 1.01,
						duration: 0.2,
						ease: 'power1.out',
					})
				}
				onFocus?.(e)
			},
			[onFocus]
		)

		const handleBlur = useCallback(
			(e: React.FocusEvent<HTMLInputElement>) => {
				if (inputRef.current) {
					gsap.to(inputRef.current.parentElement, {
						scale: 1,
						duration: 0.2,
						ease: 'power1.out',
					})
				}
				onBlur?.(e)
			},
			[onBlur]
		)

		return (
			<div ref={containerRef} className={`relative w-full ${className || ''}`}>
				<div
					className={`
				relative flex items-center w-full h-12 px-4
				bg-white dark:bg-gray-800 
				border-2 border-gray-200 dark:border-gray-600 
				focus-within:border-blue-500 dark:focus-within:border-blue-400 
				focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-500/20
				rounded-lg transition-all duration-200
				text-gray-900 dark:text-gray-100
			`}
				>
					<i className="i-ph-magnifying-glass-duotone w-5! h-5! text-gray-400 dark:text-gray-500 mr-3" />
					<input
						ref={inputRef}
						id={fieldId}
						type="search"
						className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none"
						placeholder={placeholder}
						autoComplete="off"
						aria-label={placeholder}
						onFocus={handleFocus}
						onBlur={handleBlur}
						{...rest}
					/>
				</div>
			</div>
		)
	}
)
