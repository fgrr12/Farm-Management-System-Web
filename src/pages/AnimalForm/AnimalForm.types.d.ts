import type dayjs from 'dayjs'

export interface Animal {
	uuid: string
	animalId: number
	species: Species
	breed: string
	gender: Gender
	color: string
	weight: number
	status: boolean
	picture?: string
	birthDate?: dayjs.Dayjs | string
	purchaseDate?: dayjs.Dayjs | string
	soldDate?: dayjs.Dayjs | string | null
	deathDate?: dayjs.Dayjs | string | null
}
