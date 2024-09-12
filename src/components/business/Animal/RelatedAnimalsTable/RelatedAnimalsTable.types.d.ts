export interface RelatedAnimalsTableProps {
	title: string
	animals: RelatedAnimal[]
	haveUser: boolean
	type: 'parent' | 'child'
	removeRelation: (uuid: string) => void
}
