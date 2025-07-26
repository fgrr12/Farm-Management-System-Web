import dayjs from 'dayjs'
import { type ChangeEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DatePicker } from '@/components/layout/DatePicker'
import { Select } from '@/components/ui/Select'

import type { HealthRecordsFiltersProps } from './HealthRecordsFilters.types'

export const HealthRecordsFilters: FC<HealthRecordsFiltersProps> = memo(
	({ filters, onFiltersChange, employees, userRole }) => {
		const { t } = useTranslation(['animalHealthRecords'])
		const [isOpen, setIsOpen] = useState(false)
		const dropdownRef = useRef<HTMLDivElement>(null)

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

		// Close dropdown when clicking outside
		const handleClickOutside = useCallback((event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}, [])

		// Add/remove event listener for clicking outside
		useEffect(() => {
			if (isOpen) {
				document.addEventListener('mousedown', handleClickOutside)
			} else {
				document.removeEventListener('mousedown', handleClickOutside)
			}

			return () => {
				document.removeEventListener('mousedown', handleClickOutside)
			}
		}, [isOpen, handleClickOutside])

		return (
			<div className="relative" ref={dropdownRef}>
				{/* Filter Button */}
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className={`
					flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
					${
						hasActiveFilters
							? 'border-emerald-500 bg-emerald-50 text-emerald-700'
							: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
					}
					focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
				`}
					aria-expanded={isOpen}
					aria-haspopup="true"
					aria-label={t('filter.filtersButton')}
				>
					{/* Filter Icon */}
					<div
						className={`w-5 h-5 i-material-symbols-filter-list ${hasActiveFilters ? 'text-emerald-600' : 'text-gray-500'}`}
					/>

					{/* Button Text */}
					<span className="font-medium">
						{hasActiveFilters ? t('filter.filtersActive') : t('filter.filters')}
					</span>

					{/* Active Filters Count */}
					{hasActiveFilters && (
						<span className="ml-1 px-2 py-0.5 text-xs bg-emerald-600 text-white rounded-full">
							{activeFiltersCount}
						</span>
					)}

					{/* Dropdown Arrow */}
					<div
						className={`w-4 h-4 i-material-symbols-keyboard-arrow-down transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
					/>
				</button>

				{/* Active Filters Preview */}
				{hasActiveFilters && !isOpen && (
					<div className="absolute top-full left-0 mt-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-md whitespace-nowrap z-10 max-w-xs truncate">
						{getActiveFiltersText}
					</div>
				)}

				{/* Dropdown Menu */}
				{isOpen && (
					<div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
						<div className="p-4">
							{/* Header */}
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold text-gray-900">{t('filter.filters')}</h3>
								{hasActiveFilters && (
									<button
										type="button"
										onClick={clearFilters}
										className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
									>
										{t('filter.clearFilters')}
									</button>
								)}
							</div>

							{/* Filter Controls */}
							<div className="space-y-4">
								{/* Date Range Filters */}
								<div className="grid grid-cols-2 gap-3">
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
							<div className="mt-6 pt-4 border-t border-gray-200">
								<div className="flex items-center justify-between">
									<span className="text-sm text-gray-500">
										{hasActiveFilters
											? t('filter.filtersApplied', { count: activeFiltersCount })
											: t('filter.noFiltersApplied')}
									</span>
									<button
										type="button"
										onClick={() => setIsOpen(false)}
										className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
									>
										{t('filter.done')}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		)
	}
)
