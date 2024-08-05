import type dayjs from 'dayjs'

export interface ProductionRecordForm {
	uuid: string
	animalUuid: string
	quantity: number
	date: dayjs.Dayjs | string
	notes: string
	status: boolean
}
