import { type FC, memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { CustomSelectOption } from '@/components/ui/CustomSelect'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { FilterDropdown } from '@/components/ui/FilterDropdown'

import type { TaskFiltersProps } from './TaskFilters.types'

export const TaskFilters: FC<TaskFiltersProps> = memo(({ filters, onFiltersChange, species }) => {
	const { t } = useTranslation(['tasks'])

	const handlePriorityChange = useCallback(
		(value: string | number | null) => {
			onFiltersChange({ ...filters, priority: value ? String(value) : '' })
		},
		[filters, onFiltersChange]
	)

	const handleSpeciesChange = useCallback(
		(value: string | number | null) => {
			onFiltersChange({ ...filters, speciesUuid: value ? String(value) : '' })
		},
		[filters, onFiltersChange]
	)

	const priorityOptions: CustomSelectOption[] = useMemo(
		() => [
			{ value: 'high', label: t('priority.high') },
			{ value: 'medium', label: t('priority.medium') },
			{ value: 'low', label: t('priority.low') },
		],
		[t]
	)

	const speciesOptions: CustomSelectOption[] = useMemo(
		() => species.map((s) => ({ value: s.uuid, label: s.name })),
		[species]
	)

	return (
		<FilterDropdown
			filters={filters}
			onFiltersChange={onFiltersChange}
			buttonLabel={t('filters')}
			activeButtonLabel={t('filtersActive')}
			clearButtonLabel={t('clearFilters')}
			doneButtonLabel={t('done')}
			filtersAppliedLabel={t('filtersApplied')}
			noFiltersAppliedLabel={t('noFiltersApplied')}
		>
			{/* Priority Filter */}
			<div>
				<CustomSelect
					label={t('filterByPriority')}
					placeholder={t('allPriorities')}
					value={filters.priority}
					options={priorityOptions}
					onChange={handlePriorityChange}
					clearable
				/>
			</div>

			{/* Species Filter */}
			<div>
				<CustomSelect
					label={t('filterBySpecies')}
					placeholder={t('allSpecies')}
					value={filters.speciesUuid}
					options={speciesOptions}
					onChange={handleSpeciesChange}
					clearable
				/>
			</div>
		</FilterDropdown>
	)
})
