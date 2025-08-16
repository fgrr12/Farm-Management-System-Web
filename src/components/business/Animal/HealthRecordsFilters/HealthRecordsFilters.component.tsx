import dayjs from 'dayjs'
import { type FC, memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { DatePicker } from '@/components/layout/DatePicker'
import type { CustomSelectOption } from '@/components/ui/CustomSelect'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { FilterDropdown } from '@/components/ui/FilterDropdown'

import type { HealthRecordsFiltersProps } from './HealthRecordsFilters.types'

export const HealthRecordsFilters: FC<HealthRecordsFiltersProps> = memo(
	({ filters, onFiltersChange, employees, userRole }) => {
		const { t } = useTranslation(['animalHealthRecords'])

		const handleTypeChange = useCallback(
			(value: string | number | null) => {
				onFiltersChange({ ...filters, type: value as any })
			},
			[filters, onFiltersChange]
		)

		const handleCreatedByChange = useCallback(
			(value: string | number | null) => {
				onFiltersChange({ ...filters, createdBy: value ? String(value) : '' })
			},
			[filters, onFiltersChange]
		)

		const handleDateChange = useCallback(
			(name: string) => (date: dayjs.Dayjs | null) => {
				onFiltersChange({ ...filters, [name]: date })
			},
			[filters, onFiltersChange]
		)

		const typeOptions: CustomSelectOption[] = useMemo(
			() => [
				{ value: 'Checkup', label: t('healthRecordType.checkup') },
				{ value: 'Vaccination', label: t('healthRecordType.vaccination') },
				{ value: 'Medication', label: t('healthRecordType.medication') },
				{ value: 'Surgery', label: t('healthRecordType.surgery') },
				{ value: 'Pregnancy', label: t('healthRecordType.pregnancy') },
				{ value: 'Deworming', label: t('healthRecordType.deworming') },
				{ value: 'Birth', label: t('healthRecordType.birth') },
				{ value: 'Drying', label: t('healthRecordType.drying') },
			],
			[t]
		)

		const createdByOptions: CustomSelectOption[] = useMemo(
			() => [
				{ value: 'Me', label: t('createdBy.me') },
				...employees.map((employee) => ({
					value: employee.uuid,
					label: employee.name,
				})),
			],
			[employees, t]
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
					<CustomSelect
						label={t('filter.type')}
						placeholder={t('filter.allTypes')}
						value={filters.type}
						options={typeOptions}
						onChange={handleTypeChange}
						clearable
					/>
				</div>

				{/* Created By Filter - Only for admin/owner */}
				{(userRole === 'admin' || userRole === 'owner') && (
					<div>
						<CustomSelect
							label={t('filter.createdBy')}
							placeholder={t('filter.allEmployees')}
							value={filters.createdBy}
							options={createdByOptions}
							onChange={handleCreatedByChange}
							clearable
						/>
					</div>
				)}
			</FilterDropdown>
		)
	}
)
