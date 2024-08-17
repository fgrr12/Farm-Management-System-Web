import type dayjs from 'dayjs'

export interface ProductionRecordsCardsProps {
	productionRecords: ProductionRecord[]
	haveUser: boolean
	farm: Farm | null
	removeProductionRecord: (uuid: string) => void
}

declare interface ProductionRecord {
	uuid: string
	animalUuid: string
	date: dayjs.Dayjs | string
	quantity: number
	notes: string
}
