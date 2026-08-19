import type dayjs from 'dayjs'

import type { Farm, HealthRecord, HealthRecordType, User } from '@/types'

export interface HealthRecordsTableProps {
	healthRecords: HealthRecord[]
	employees: User[]
	haveUser: boolean
	farm: Farm | null
	removeHealthRecord: (uuid: string) => void
}

export interface HealthRecordsFilters {
	fromDate: dayjs.Dayjs | null
	toDate: dayjs.Dayjs | null
	/** '' means "any type" — a filter value, not a valid record type. */
	type: HealthRecordType | ''
	createdBy: string
}
