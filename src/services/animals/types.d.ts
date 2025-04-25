export interface GetAnimalsProps {
	speciesUuid: string
	search: string
	farmUuid: string | null
}

export interface UpdateAnimalsBySpecieProps {
	farm: Farm
	species: Species[] & { editable: boolean }[]
}
