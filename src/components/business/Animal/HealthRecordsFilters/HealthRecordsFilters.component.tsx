import dayjs from 'dayjs'
import { type ChangeEvent, type FC, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { DatePicker } from '@/components/layout/DatePicker'
import { FilterDropdown } from '@/components/ui/FilterDropdown'
import { Select } from '@/components/ui/Select'

import type { HealthRecordsFiltersProps } from './HealthRecordsFilters.types'

export const HealthRecordsFilters: FC<HealthRecordsFiltersProps> = memo(
	({ filters, onFiltersChange, employees, userRole }) => {
		const { t } = useTranslation(['animalHealthRecords'])

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

		return (
			<FilterDropdown
				filters={filters}
				onFiltersChange={onFiltersChange}
				buttonLabel={t('filter.filters')}
				activeButtonLabel={t('filter.filtersActive')}
				clearButtonLabel={t('filter.clearFilters')}
				doneButtonLabel={t('filter.done')}
				filtersAppliedLabel={t('filter.filtersApplied')}
				noFiltersAppliedLabel={t('filter.noFiltersApplied')}
				className="emerald-theme"
			>
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
			</FilterDropdown>
		)
	}
)
