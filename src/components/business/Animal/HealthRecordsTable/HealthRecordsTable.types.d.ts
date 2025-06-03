import type dayjs from 'dayjs'

export interface HealthRecordsTableProps {
	healthRecords: HealthRecord[]
	haveUser: boolean
	farm: Farm | null
	removeHealthRecord: (uuid: string) => void
}

export interface HealthRecord {
	uuid: string
	animalUuid: string
	reason: string
	notes: string
	type: HealthRecordType
	reviewedBy: string
	date: dayjs.Dayjs | string
	weight?: number
	temperature?: number
	medication?: string
	dosage?: string
	frequency?: string
	duration?: string
}
