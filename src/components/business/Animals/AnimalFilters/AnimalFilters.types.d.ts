import type { AnimalsFilters } from '@/pages/Animals/Animals.types'

export interface AnimalFiltersProps {
	filters: AnimalsFilters
	onFiltersChange: (filters: AnimalsFilters) => void
	species: Species[]
}
