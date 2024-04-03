import type dayjs from 'dayjs'

export interface ProductionRecordsTableProps {
	productionRecords: ProductionRecord[]
	user: boolean
}

declare interface ProductionRecord {
	animalUuid: string
	date: dayjs.Dayjs | string
	quantity: number
	notes: string
}
