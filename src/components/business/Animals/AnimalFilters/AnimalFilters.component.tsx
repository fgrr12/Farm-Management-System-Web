import { type ChangeEvent, type FC, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { FilterDropdown } from '@/components/ui/FilterDropdown'
import { Search } from '@/components/ui/Search'
import { Select } from '@/components/ui/Select'

import type { AnimalFiltersProps } from './AnimalFilters.types'

export const AnimalFilters: FC<AnimalFiltersProps> = memo(
	({ filters, onFiltersChange, species }) => {
		const { t } = useTranslation(['animals'])

		const handleSelectChange = useCallback(
			(event: ChangeEvent<HTMLSelectElement>) => {
				const { name, value } = event.target
				onFiltersChange({ ...filters, [name]: value })
			},
			[filters, onFiltersChange]
		)

		const handleSearchChange = useCallback(
			(event: ChangeEvent<HTMLInputElement>) => {
				const { value } = event.target
				onFiltersChange({ ...filters, search: value })
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
				{/* Search Filter */}
				<div>
					<Search
						placeholder={t('search')}
						value={filters.search}
						onChange={handleSearchChange}
						aria-label={t('accessibility.searchAnimals')}
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

				{/* Gender Filter */}
				<div>
					<Select
						name="gender"
						legend={t('filterByGender')}
						defaultLabel={t('allGenders')}
						value={filters.gender}
						items={[
							{ value: 'female', name: t('gender.female') },
							{ value: 'male', name: t('gender.male') },
						]}
						onChange={handleSelectChange}
						aria-label={t('filterByGender')}
					/>
				</div>

				{/* Status Filter */}
				<div>
					<Select
						name="status"
						legend={t('filterByStatus')}
						defaultLabel={t('allStatuses')}
						value={filters.status}
						items={[
							{ value: 'inFarm', name: t('status.inFarm') },
							{ value: 'dead', name: t('status.dead') },
							{ value: 'sold', name: t('status.sold') },
						]}
						onChange={handleSelectChange}
						aria-label={t('filterByStatus')}
					/>
				</div>
			</FilterDropdown>
		)
	}
)
