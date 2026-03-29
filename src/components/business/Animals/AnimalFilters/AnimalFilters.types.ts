import type { AnimalsFilters } from '@/pages/Animals/Animals.types'

import type { Species } from '@/types'

export interface AnimalFiltersProps {
	filters: AnimalsFilters
	onFiltersChange: (filters: AnimalsFilters) => void
	species: Species[]
}
