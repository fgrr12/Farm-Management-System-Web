export interface RelatedAnimalsCardsProps {
	title: string
	animals: RelatedAnimal[]
	haveUser: boolean
	type: 'parent' | 'child'
	removeRelation: (uuid: string) => void
}
