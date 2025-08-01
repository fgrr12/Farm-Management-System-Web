import { type ChangeEvent, type FC, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { FilterDropdown } from '@/components/ui/FilterDropdown'
import { Select } from '@/components/ui/Select'

import type { TaskFiltersProps } from './TaskFilters.types'

export const TaskFilters: FC<TaskFiltersProps> = memo(({ filters, onFiltersChange, species }) => {
	const { t } = useTranslation(['tasks'])

	const handleSelectChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			const { name, value } = event.target
			onFiltersChange({ ...filters, [name]: value })
		},
		[filters, onFiltersChange]
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
		</FilterDropdown>
	)
})
