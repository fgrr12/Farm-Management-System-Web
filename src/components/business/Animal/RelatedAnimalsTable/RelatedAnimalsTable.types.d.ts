import type dayjs from 'dayjs'

export interface RelatedAnimalsTableProps {
	title: string
	animals: RelatedAnimal[]
	user: boolean
	type: 'parent' | 'child'
}

interface RelatedAnimal {
	uuid: string
	parent: {
		animalUuid: string
		animalId: number
		breed: string
		relation: string
	}
	child: {
		animalUuid: string
		animalId: number
		breed: string
		relation: string
	}
	createdAt?: dayjs.Dayjs | string
	updatedAt?: dayjs.Dayjs | string
}
