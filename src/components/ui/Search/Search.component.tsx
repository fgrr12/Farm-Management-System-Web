import { type FC, memo, useId } from 'react'

import type { SearchProps } from './Search.types'

export const Search: FC<SearchProps> = memo(({ placeholder, className, ...rest }) => {
	const fieldId = useId()

	return (
		<div className={`relative w-full animate-fade-in-up ${className || ''}`}>
			<div
				className={`
				relative flex items-center w-full h-12 px-4
				bg-white dark:bg-gray-800 
				border-2 border-gray-200 dark:border-gray-600 
				focus-within:border-blue-500 dark:focus-within:border-blue-400 
				focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-500/20
				focus-within:scale-[1.01]
				rounded-lg transition-all duration-200
				text-gray-900 dark:text-gray-100
			`}
			>
				<i className="i-ph-magnifying-glass-duotone w-5! h-5! text-gray-400 dark:text-gray-500 mr-3" />
				<input
					id={fieldId}
					type="search"
					className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-300 focus:outline-none text-base"
					placeholder={placeholder}
					autoComplete="off"
					aria-label={placeholder}
					{...rest}
				/>
			</div>
		</div>
	)
})
