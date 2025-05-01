export interface UpdateAnimalsBySpecieProps {
	farm: Farm
	species: Species[] & { editable: boolean }[]
}
