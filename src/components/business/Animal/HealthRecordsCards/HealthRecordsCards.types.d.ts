import type dayjs from 'dayjs'

export interface HealthRecordsCardsProps {
	healthRecords: HealthRecord[]
	user: User | null
	removeHealthRecord: (uuid: string) => void
}

declare interface HealthRecord {
	uuid: string
	animalUuid: string
	reason: string
	notes: string
	type: string
	reviewedBy: string
	date: dayjs.Dayjs | string
	weight?: number
	temperature?: number
	medication?: string
	dosage?: string
	frequency?: string
	duration?: string
}
