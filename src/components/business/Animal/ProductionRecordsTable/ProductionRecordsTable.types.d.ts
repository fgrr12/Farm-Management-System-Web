import type dayjs from 'dayjs'

export interface ProductionRecordsTableProps {
	productionRecords: ProductionRecord[]
	user: boolean
}

declare interface ProductionRecord {
	animalId: number
	date: dayjs.Dayjs
	quantity: number
	notes: string
}
