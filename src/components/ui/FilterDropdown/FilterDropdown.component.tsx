import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface FilterDropdownProps<T = Record<string, any>> {
	filters: T
	onFiltersChange: (filters: T) => void
	children: ReactNode
	buttonLabel?: string
	activeButtonLabel?: string
	clearButtonLabel?: string
	doneButtonLabel?: string
	filtersAppliedLabel?: string
	noFiltersAppliedLabel?: string
	className?: string
}

export const FilterDropdown = <T extends Record<string, any>>(props: FilterDropdownProps<T>) => {
	const {
		filters,
		onFiltersChange,
		children,
		buttonLabel = 'Filters',
		activeButtonLabel = 'Filters Active',
		clearButtonLabel = 'Clear Filters',
		doneButtonLabel = 'Done',
		filtersAppliedLabel = '{{count}} filters applied',
		noFiltersAppliedLabel = 'No filters applied',
		className,
	} = props

	const [isOpen, setIsOpen] = useState(false)
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 320 })
	const dropdownRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	const activeFiltersCount = useMemo(() => {
		return Object.values(filters as Record<string, any>).filter(
			(value) => value !== '' && value !== null && value !== undefined
		).length
	}, [filters])

	const hasActiveFilters = activeFiltersCount > 0

	const clearFilters = useCallback(() => {
		const clearedFilters = Object.keys(filters as Record<string, any>).reduce((acc, key) => {
			acc[key] = ''
			return acc
		}, {} as any)
		onFiltersChange(clearedFilters)
		setIsOpen(false)
	}, [filters, onFiltersChange])

	const calculateDropdownPosition = useCallback(() => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect()
			const dropdownHeight = 400
			const spaceAbove = rect.top
			const spaceBelow = window.innerHeight - rect.bottom
			const isMobile = window.innerWidth < 640

			if (isMobile) {
				// En mobile, usar posicionamiento más simple y centrado
				const dropdownWidth = Math.min(320, window.innerWidth - 32) // 16px margin on each side
				const leftPosition = Math.max(16, (window.innerWidth - dropdownWidth) / 2)

				// En mobile, siempre mostrar debajo del botón si hay espacio, sino arriba
				const showAbove = spaceBelow < 300 && spaceAbove > 300

				setDropdownPosition({
					top: showAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
					left: leftPosition,
					width: dropdownWidth,
				})
			} else {
				// Desktop: posicionamiento original
				const showAbove = spaceAbove > dropdownHeight || spaceBelow < dropdownHeight
				const dropdownWidth = 320
				let leftPosition = rect.right - dropdownWidth

				setDropdownPosition({
					top: showAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
					left: leftPosition,
					width: dropdownWidth,
				})
			}
		}
	}, [])

	const handleClickOutside = useCallback((event: MouseEvent) => {
		if (
			dropdownRef.current &&
			!dropdownRef.current.contains(event.target as Node) &&
			buttonRef.current &&
			!buttonRef.current.contains(event.target as Node)
		) {
			setIsOpen(false)
		}
	}, [])

	const toggleDropdown = useCallback(() => {
		if (!isOpen) {
			calculateDropdownPosition()
		}
		setIsOpen(!isOpen)
	}, [isOpen, calculateDropdownPosition])

	useEffect(() => {
		if (isOpen) {
			const isMobile = window.innerWidth < 640

			document.addEventListener('mousedown', handleClickOutside)
			window.addEventListener('resize', calculateDropdownPosition)
			window.addEventListener('scroll', calculateDropdownPosition, { passive: true })

			// En mobile, también escuchar orientationchange y visualViewport
			if (isMobile) {
				window.addEventListener('orientationchange', calculateDropdownPosition)

				// Recalcular posición cuando cambie el viewport (teclado virtual)
				if (window.visualViewport) {
					window.visualViewport.addEventListener('resize', calculateDropdownPosition)
				}

				// Recalcular posición periódicamente en mobile para evitar problemas
				const intervalId = setInterval(calculateDropdownPosition, 100)

				return () => {
					document.removeEventListener('mousedown', handleClickOutside)
					window.removeEventListener('resize', calculateDropdownPosition)
					window.removeEventListener('scroll', calculateDropdownPosition)
					window.removeEventListener('orientationchange', calculateDropdownPosition)

					if (window.visualViewport) {
						window.visualViewport.removeEventListener('resize', calculateDropdownPosition)
					}

					clearInterval(intervalId)
				}
			}

			return () => {
				document.removeEventListener('mousedown', handleClickOutside)
				window.removeEventListener('resize', calculateDropdownPosition)
				window.removeEventListener('scroll', calculateDropdownPosition)
			}
		}
	}, [isOpen, handleClickOutside, calculateDropdownPosition])

	return (
		<>
			<div className={`relative ${className || ''}`}>
				<button
					ref={buttonRef}
					type="button"
					onClick={toggleDropdown}
					className={`
						flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
						${
							hasActiveFilters
								? className?.includes('emerald-theme')
									? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
									: 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
								: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
						}
						focus:outline-none focus:ring-2 ${
							className?.includes('emerald-theme')
								? 'focus:ring-emerald-500 dark:focus:ring-emerald-400'
								: 'focus:ring-blue-500 dark:focus:ring-blue-400'
						} focus:border-transparent
					`}
					aria-expanded={isOpen}
					aria-haspopup="true"
				>
					<div
						className={`w-5! h-5! i-material-symbols-filter-list ${
							hasActiveFilters
								? className?.includes('emerald-theme')
									? 'bg-emerald-600! dark:bg-emerald-400!'
									: 'bg-blue-600! dark:bg-blue-400!'
								: 'bg-gray-500! dark:bg-gray-400!'
						}`}
					/>
					<span className="font-medium">{hasActiveFilters ? activeButtonLabel : buttonLabel}</span>
					{hasActiveFilters && (
						<span
							className={`ml-1 px-2 py-0.5 text-xs text-white dark:text-gray-100 rounded-full ${
								className?.includes('emerald-theme')
									? 'bg-emerald-600 dark:bg-emerald-500'
									: 'bg-blue-600 dark:bg-blue-500'
							}`}
						>
							{activeFiltersCount}
						</span>
					)}
					<div
						className={`w-4! h-4! i-material-symbols-keyboard-arrow-down transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
							hasActiveFilters
								? className?.includes('emerald-theme')
									? 'bg-emerald-600! dark:bg-emerald-400!'
									: 'bg-blue-600! dark:bg-blue-400!'
								: 'bg-gray-500! dark:bg-gray-400!'
						}`}
					/>
				</button>
			</div>

			{isOpen && (
				<div
					ref={dropdownRef}
					className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl dark:shadow-2xl z-[9999] filter-dropdown"
					style={{
						top: `${dropdownPosition.top}px`,
						left: `${dropdownPosition.left}px`,
						width: `${dropdownPosition.width}px`,
					}}
				>
					<div className="p-4">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
								{buttonLabel}
							</h3>
							{hasActiveFilters && (
								<button
									type="button"
									onClick={clearFilters}
									className={`text-sm font-medium transition-colors ${
										className?.includes('emerald-theme')
											? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300'
											: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
									}`}
								>
									{clearButtonLabel}
								</button>
							)}
						</div>

						<div className="space-y-4">{children}</div>

						<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500 dark:text-gray-400">
									{hasActiveFilters
										? filtersAppliedLabel.replace('{{count}}', activeFiltersCount.toString())
										: noFiltersAppliedLabel}
								</span>
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
								>
									{doneButtonLabel}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
