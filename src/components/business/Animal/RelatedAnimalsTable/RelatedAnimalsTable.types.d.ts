export interface RelatedAnimalsTableProps {
	title: string
	animals: Relation[]
	haveUser: boolean
	type: 'parent' | 'child'
	removeRelation: (uuid: string) => void
}
