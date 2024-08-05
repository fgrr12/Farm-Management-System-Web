import type dayjs from 'dayjs'

export interface GetProductionRecordsProps {
	animalUuid: string
}

export interface SetProductionRecordProps {
	uuid: string
	animalUuid: string
	quantity: number
	date: dayjs.Dayjs | string
	notes: string
}

export interface GetProductionRecordResponse {
	uuid: string
	animalUuid: string
	quantity: number
	date: dayjs.Dayjs | string
	notes: string
	status: boolean
}
