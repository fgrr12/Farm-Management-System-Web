import dayjs from 'dayjs'

export interface HealthRecordsTableProps {
	healthRecords: AnimalHealthRecord[]
	employees: User[]
	haveUser: boolean
	farm: Farm | null
	removeHealthRecord: (uuid: string) => void
}

export interface HealthRecordsFilters {
	fromDate: dayjs.Dayjs | string
	toDate: string
	type: HealthRecordType
	createdBy: string
}
