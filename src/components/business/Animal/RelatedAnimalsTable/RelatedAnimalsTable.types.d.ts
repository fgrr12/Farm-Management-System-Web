export interface RelatedAnimalsTableProps {
	title: string
	animals: Animal[]
	user: boolean
}

declare interface Animal {
	animalId: number
	breed: string
	relation: string
}
