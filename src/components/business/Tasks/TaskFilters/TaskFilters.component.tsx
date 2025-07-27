import {
	type ChangeEvent,
	type FC,
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@/components/ui/Select'

import type { TaskFiltersProps } from './TaskFilters.types'

export const TaskFilters: FC<TaskFiltersProps> = memo(({ filters, onFiltersChange, species }) => {
	const { t } = useTranslation(['tasks'])
	const [isOpen, setIsOpen] = useState(false)
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 320 })
	const dropdownRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	const handleSelectChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			const { name, value } = event.target
			onFiltersChange({ ...filters, [name]: value })
		},
		[filters, onFiltersChange]
	)

	const clearFilters = useCallback(() => {
		onFiltersChange({
			priority: '',
			speciesUuid: '',
		})
		setIsOpen(false)
	}, [onFiltersChange])

	const activeFiltersCount = useMemo(() => {
		let count = 0
		if (filters.priority) count++
		if (filters.speciesUuid) count++
		return count
	}, [filters])

	const hasActiveFilters = activeFiltersCount > 0

	const getActiveFiltersText = useMemo(() => {
		const activeFilters: string[] = []

		if (filters.priority) {
			activeFilters.push(t(`priority.${filters.priority}`))
		}

		if (filters.speciesUuid) {
			const selectedSpecies = species.find((s) => s.uuid === filters.speciesUuid)
			if (selectedSpecies) {
				activeFilters.push(selectedSpecies.name)
			}
		}

		return activeFilters.join(', ')
	}, [filters, species, t])

	// Calculate dropdown position
	const calculateDropdownPosition = useCallback(() => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect()
			const dropdownHeight = 400 // Approximate height of dropdown
			const spaceAbove = rect.top
			const spaceBelow = window.innerHeight - rect.bottom
			const isMobile = window.innerWidth < 640 // sm breakpoint

			// Always show above (like before), but improve mobile positioning
			const showAbove = spaceAbove > dropdownHeight || spaceBelow < dropdownHeight

			// Calculate width and left position
			const dropdownWidth = isMobile ? Math.min(320, window.innerWidth - 16) : 320
			let leftPosition = rect.left

			// On mobile, ensure it fits on screen
			if (isMobile) {
				leftPosition = Math.max(8, Math.min(leftPosition, window.innerWidth - dropdownWidth - 8))
			}

			setDropdownPosition({
				top: showAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
				left: leftPosition,
				width: dropdownWidth,
			})
		}
	}, [])

	// Close dropdown when clicking outside
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

	// Toggle dropdown and calculate position
	const toggleDropdown = useCallback(() => {
		if (!isOpen) {
			calculateDropdownPosition()
		}
		setIsOpen(!isOpen)
	}, [isOpen, calculateDropdownPosition])

	// Add/remove event listener for clicking outside and window resize
	useEffect(() => {
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			window.addEventListener('resize', calculateDropdownPosition)
			window.addEventListener('scroll', calculateDropdownPosition)
		} else {
			document.removeEventListener('mousedown', handleClickOutside)
			window.removeEventListener('resize', calculateDropdownPosition)
			window.removeEventListener('scroll', calculateDropdownPosition)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			window.removeEventListener('resize', calculateDropdownPosition)
			window.removeEventListener('scroll', calculateDropdownPosition)
		}
	}, [isOpen, handleClickOutside, calculateDropdownPosition])

	return (
		<>
			<div className="relative">
				{/* Filter Button */}
				<button
					ref={buttonRef}
					type="button"
					onClick={toggleDropdown}
					className={`
					flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
					${
						hasActiveFilters
							? 'border-blue-500 bg-blue-50 text-blue-700'
							: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
					}
					focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
				`}
					aria-expanded={isOpen}
					aria-haspopup="true"
					aria-label={t('filtersButton')}
				>
					{/* Filter Icon */}
					<div
						className={`w-5! h-5! i-material-symbols-filter-list ${hasActiveFilters ? 'bg-blue-600!' : 'bg-gray-500!'}`}
					/>

					{/* Button Text */}
					<span className="font-medium">
						{hasActiveFilters ? t('filtersActive') : t('filters')}
					</span>

					{/* Active Filters Count */}
					{hasActiveFilters && (
						<span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
							{activeFiltersCount}
						</span>
					)}

					{/* Dropdown Arrow */}
					<div
						className={`w-4! h-4! i-material-symbols-keyboard-arrow-down transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
					/>
				</button>

				{/* Active Filters Preview - Only show on larger screens to avoid overlap */}
				{hasActiveFilters && !isOpen && (
					<div className="hidden sm:block absolute top-full left-0 mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-md whitespace-nowrap z-10 max-w-xs truncate">
						{getActiveFiltersText}
					</div>
				)}
			</div>

			{/* Dropdown Menu - Portal to body to avoid overflow issues */}
			{isOpen && (
				<div
					ref={dropdownRef}
					className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]"
					style={{
						top: `${dropdownPosition.top}px`,
						left: `${dropdownPosition.left}px`,
						width: `${dropdownPosition.width}px`,
					}}
				>
					<div className="p-4">
						{/* Header */}
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900">{t('filters')}</h3>
							{hasActiveFilters && (
								<button
									type="button"
									onClick={clearFilters}
									className="text-sm text-blue-600 hover:text-blue-800 font-medium"
								>
									{t('clearFilters')}
								</button>
							)}
						</div>

						{/* Filter Controls */}
						<div className="space-y-4">
							{/* Priority Filter */}
							<div>
								<Select
									name="priority"
									legend={t('filterByPriority')}
									defaultLabel={t('allPriorities')}
									value={filters.priority}
									items={[
										{ value: 'high', name: t('priority.high') },
										{ value: 'medium', name: t('priority.medium') },
										{ value: 'low', name: t('priority.low') },
									]}
									onChange={handleSelectChange}
									aria-label={t('filterByPriority')}
								/>
							</div>

							{/* Species Filter */}
							<div>
								<Select
									name="speciesUuid"
									legend={t('filterBySpecies')}
									defaultLabel={t('allSpecies')}
									optionValue="uuid"
									optionLabel="name"
									value={filters.speciesUuid}
									items={species}
									onChange={handleSelectChange}
									aria-label={t('filterBySpecies')}
								/>
							</div>
						</div>

						{/* Footer */}
						<div className="mt-6 pt-4 border-t border-gray-200">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{hasActiveFilters
										? t('filtersApplied', { count: activeFiltersCount })
										: t('noFiltersApplied')}
								</span>
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
								>
									{t('done')}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
})
