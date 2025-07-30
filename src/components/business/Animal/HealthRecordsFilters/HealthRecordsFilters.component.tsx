import dayjs from 'dayjs'
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

import { DatePicker } from '@/components/layout/DatePicker'
import { Select } from '@/components/ui/Select'

import type { HealthRecordsFiltersProps } from './HealthRecordsFilters.types'

export const HealthRecordsFilters: FC<HealthRecordsFiltersProps> = memo(
	({ filters, onFiltersChange, employees, userRole }) => {
		const { t } = useTranslation(['animalHealthRecords'])
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

		const handleDateChange = useCallback(
			(name: string) => (date: dayjs.Dayjs | null) => {
				onFiltersChange({ ...filters, [name]: date })
			},
			[filters, onFiltersChange]
		)

		const clearFilters = useCallback(() => {
			onFiltersChange({
				fromDate: null,
				toDate: null,
				type: '',
				createdBy: '',
			})
			setIsOpen(false)
		}, [onFiltersChange])

		const activeFiltersCount = useMemo(() => {
			let count = 0
			if (filters.fromDate) count++
			if (filters.toDate) count++
			if (filters.type) count++
			if (filters.createdBy) count++
			return count
		}, [filters])

		const hasActiveFilters = activeFiltersCount > 0

		const getActiveFiltersText = useMemo(() => {
			const activeFilters: string[] = []

			if (filters.type) {
				activeFilters.push(t(`healthRecordType.${filters.type.toLowerCase()}`))
			}

			if (filters.createdBy) {
				if (filters.createdBy === 'Me') {
					activeFilters.push(t('createdBy.me'))
				} else {
					const employee = employees.find((emp) => emp.uuid === filters.createdBy)
					if (employee) {
						activeFilters.push(employee.name)
					}
				}
			}

			if (filters.fromDate) {
				activeFilters.push(`${t('filter.from')}: ${dayjs(filters.fromDate).format('DD/MM/YYYY')}`)
			}

			if (filters.toDate) {
				activeFilters.push(`${t('filter.to')}: ${dayjs(filters.toDate).format('DD/MM/YYYY')}`)
			}

			return activeFilters.join(', ')
		}, [filters, employees, t])

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
				let leftPosition = rect.right - dropdownWidth

				// On mobile, center the dropdown or ensure it fits on screen
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
						? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
						: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
				}
				focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent
			`}
						aria-expanded={isOpen}
						aria-haspopup="true"
						aria-label={t('filter.filtersButton')}
					>
						{/* Filter Icon */}
						<div
							className={`w-5! h-5! i-material-symbols-filter-list ${hasActiveFilters ? 'bg-emerald-600 dark:bg-emerald-400!' : 'bg-gray-500 dark:bg-gray-400!'}`}
						/>

						{/* Button Text */}
						<span className="font-medium">
							{hasActiveFilters ? t('filter.filtersActive') : t('filter.filters')}
						</span>

						{/* Active Filters Count */}
						{hasActiveFilters && (
							<span className="ml-1 px-2 py-0.5 text-xs bg-emerald-600 dark:bg-emerald-500 text-white dark:text-gray-100 rounded-full">
								{activeFiltersCount}
							</span>
						)}

						{/* Dropdown Arrow */}
						<div
							className={`w-4 h-4 i-material-symbols-keyboard-arrow-down transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${hasActiveFilters ? 'bg-emerald-600 dark:bg-emerald-400!' : 'bg-gray-500 dark:bg-gray-400!'}`}
						/>
					</button>

					{/* Active Filters Preview - Only show on larger screens to avoid overlap */}
					{hasActiveFilters && !isOpen && (
						<div className="hidden sm:block absolute bottom-full right-0 mb-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-xs rounded-md whitespace-nowrap z-10 max-w-xs truncate border border-emerald-200 dark:border-emerald-700">
							{getActiveFiltersText}
						</div>
					)}
				</div>

				{/* Dropdown Menu - Portal to body to avoid overflow issues */}
				{isOpen && (
					<div
						ref={dropdownRef}
						className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl dark:shadow-2xl z-[9999]"
						style={{
							top: `${dropdownPosition.top}px`,
							left: `${dropdownPosition.left}px`,
							width: `${dropdownPosition.width}px`,
						}}
					>
						<div className="p-4">
							{/* Header */}
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
									{t('filter.filters')}
								</h3>
								{hasActiveFilters && (
									<button
										type="button"
										onClick={clearFilters}
										className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium transition-colors"
									>
										{t('filter.clearFilters')}
									</button>
								)}
							</div>

							{/* Filter Controls */}
							<div className="space-y-4">
								{/* Date Range Filters */}
								<div className="space-y-3">
									<div>
										<DatePicker
											legend={t('filter.fromDate')}
											label={t('filter.fromDate')}
											date={filters.fromDate ? dayjs(filters.fromDate) : null}
											onDateChange={handleDateChange('fromDate')}
										/>
									</div>
									<div>
										<DatePicker
											legend={t('filter.toDate')}
											label={t('filter.toDate')}
											date={filters.toDate ? dayjs(filters.toDate) : null}
											onDateChange={handleDateChange('toDate')}
										/>
									</div>
								</div>

								{/* Type Filter */}
								<div>
									<Select
										name="type"
										legend={t('filter.type')}
										defaultLabel={t('filter.allTypes')}
										value={filters.type}
										items={[
											{ value: 'Checkup', name: t('healthRecordType.checkup') },
											{ value: 'Vaccination', name: t('healthRecordType.vaccination') },
											{ value: 'Medication', name: t('healthRecordType.medication') },
											{ value: 'Surgery', name: t('healthRecordType.surgery') },
											{ value: 'Pregnancy', name: t('healthRecordType.pregnancy') },
											{ value: 'Deworming', name: t('healthRecordType.deworming') },
											{ value: 'Birth', name: t('healthRecordType.birth') },
											{ value: 'Drying', name: t('healthRecordType.drying') },
										]}
										onChange={handleSelectChange}
										aria-label={t('filter.type')}
									/>
								</div>

								{/* Created By Filter - Only for admin/owner */}
								{(userRole === 'admin' || userRole === 'owner') && (
									<div>
										<Select
											name="createdBy"
											legend={t('filter.createdBy')}
											defaultLabel={t('filter.allEmployees')}
											value={filters.createdBy}
											items={[
												{ value: 'Me', name: t('createdBy.me') },
												...employees.map((employee) => ({
													value: employee.uuid,
													name: employee.name,
												})),
											]}
											onChange={handleSelectChange}
											aria-label={t('filter.createdBy')}
										/>
									</div>
								)}
							</div>

							{/* Footer */}
							<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-500 dark:text-gray-400">
										{hasActiveFilters
											? t('filter.filtersApplied', { count: activeFiltersCount })
											: t('filter.noFiltersApplied')}
									</span>
									<button
										type="button"
										onClick={() => setIsOpen(false)}
										className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
									>
										{t('filter.done')}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</>
		)
	}
)
