import dayjs from 'dayjs'

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
	type: HealthRecordType
	createdBy: string
}
