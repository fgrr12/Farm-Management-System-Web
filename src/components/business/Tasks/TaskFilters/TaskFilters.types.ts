import type { TaskFilters } from '@/pages/Tasks/Tasks.types'

import type { Species } from '@/types'

export interface TaskFiltersProps {
	filters: TaskFilters
	onFiltersChange: (filters: TaskFilters) => void
	species: Species[]
}
