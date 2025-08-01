import type { HealthRecordsFilters } from '../HealthRecordsTable/HealthRecordsTable.types'

export interface HealthRecordsFiltersProps {
	filters: HealthRecordsFilters
	onFiltersChange: (filters: HealthRecordsFilters) => void
	employees: User[]
	userRole?: string
}
