import type dayjs from 'dayjs'

export interface RelatedAnimalsCardsProps {
	title: string
	animals: RelatedAnimal[]
	haveUser: boolean
	type: 'parent' | 'child'
	removeRelation: (uuid: string) => void
}

interface RelatedAnimal {
	uuid: string
	parent: {
		animalUuid: string
		animalId: string
		breed: string
		relation: string
	}
	child: {
		animalUuid: string
		animalId: string
		breed: string
		relation: string
	}
	createdAt?: dayjs.Dayjs | string
	updatedAt?: dayjs.Dayjs | string
}
