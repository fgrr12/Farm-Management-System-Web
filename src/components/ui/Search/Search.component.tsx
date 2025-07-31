import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { memo, useCallback, useId, useRef } from 'react'

import type { SearchProps } from './Search.types'

export const Search: FC<SearchProps> = memo(({ placeholder, ...rest }) => {
	const fieldId = useId()
	const containerRef = useRef<HTMLDivElement>(null)
	const labelRef = useRef<HTMLLabelElement>(null)

	useGSAP(() => {
		if (containerRef.current) {
			gsap.fromTo(
				containerRef.current,
				{ y: 10, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
			)
		}
	}, [])

	const handleFocus = useCallback(() => {
		if (labelRef.current) {
			gsap.to(labelRef.current, {
				scale: 1.01,
				duration: 0.2,
				ease: 'power1.out',
			})
		}
	}, [])

	const handleBlur = useCallback(() => {
		if (labelRef.current) {
			gsap.to(labelRef.current, {
				scale: 1,
				duration: 0.2,
				ease: 'power1.out',
			})
		}
	}, [])

	return (
		<div ref={containerRef} className="w-full">
			<fieldset className="fieldset w-full">
				<legend className="fieldset-legend dark:text-gray-300">{placeholder}</legend>
				<label
					ref={labelRef}
					className="input p-2 w-full h-12 rounded-md transition-all duration-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400"
				>
					<i className="i-ph-magnifying-glass-duotone h-6! w-6! opacity-50 dark:opacity-60 text-gray-600 dark:text-gray-300" />
					<input
						id={fieldId}
						type="search"
						className="grow bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
						placeholder={placeholder}
						autoComplete="off"
						aria-label={placeholder}
						onFocus={handleFocus}
						onBlur={handleBlur}
						{...rest}
					/>
				</label>
			</fieldset>
		</div>
	)
})
