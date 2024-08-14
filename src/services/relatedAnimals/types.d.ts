import type dayjs from 'dayjs'

export interface GetRelatedAnimalsResponse {
	uuid: string
	parent: SelectedAnimal
	child: SelectedAnimal
	createdAt?: dayjs.Dayjs | string
	updatedAt?: dayjs.Dayjs | string
}

export interface SetRelatedAnimalProps {
	uuid: string
	parent: SelectedAnimal | null
	child: SelectedAnimal | null
	createdAt?: dayjs.Dayjs | string
	updatedAt?: dayjs.Dayjs | string
}

interface SelectedAnimal {
	animalUuid: string
	animalId: string
	breed: string
	relation: string
}
