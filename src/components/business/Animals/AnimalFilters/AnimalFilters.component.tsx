import { type ChangeEvent, type FC, memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { CustomSelectOption } from '@/components/ui/CustomSelect'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { FilterDropdown } from '@/components/ui/FilterDropdown'
import { Search } from '@/components/ui/Search'

import type { AnimalFiltersProps } from './AnimalFilters.types'

export const AnimalFilters: FC<AnimalFiltersProps> = memo(
	({ filters, onFiltersChange, species }) => {
		const { t } = useTranslation(['animals'])

		const handleSpeciesChange = useCallback(
			(value: string | number | null) => {
				onFiltersChange({ ...filters, speciesUuid: value ? String(value) : '' })
			},
			[filters, onFiltersChange]
		)

		const handleGenderChange = useCallback(
			(value: string | number | null) => {
				onFiltersChange({ ...filters, gender: value ? String(value) : '' })
			},
			[filters, onFiltersChange]
		)

		const handleStatusChange = useCallback(
			(value: string | number | null) => {
				onFiltersChange({ ...filters, status: value ? String(value) : '' })
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

		const speciesOptions: CustomSelectOption[] = useMemo(
			() => species.map((s) => ({ value: s.uuid, label: s.name })),
			[species]
		)

		const genderOptions: CustomSelectOption[] = useMemo(
			() => [
				{ value: 'female', label: t('gender.female') },
				{ value: 'male', label: t('gender.male') },
			],
			[t]
		)

		const statusOptions: CustomSelectOption[] = useMemo(
			() => [
				{ value: 'inFarm', label: t('status.inFarm') },
				{ value: 'dead', label: t('status.dead') },
				{ value: 'sold', label: t('status.sold') },
			],
			[t]
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
					<CustomSelect
						label={t('filterBySpecies')}
						placeholder={t('allSpecies')}
						value={filters.speciesUuid}
						options={speciesOptions}
						onChange={handleSpeciesChange}
						clearable
					/>
				</div>

				{/* Gender Filter */}
				<div>
					<CustomSelect
						label={t('filterByGender')}
						placeholder={t('allGenders')}
						value={filters.gender}
						options={genderOptions}
						onChange={handleGenderChange}
						clearable
					/>
				</div>

				{/* Status Filter */}
				<div>
					<CustomSelect
						label={t('filterByStatus')}
						placeholder={t('allStatuses')}
						value={filters.status}
						options={statusOptions}
						onChange={handleStatusChange}
						clearable
					/>
				</div>
			</FilterDropdown>
		)
	}
)
