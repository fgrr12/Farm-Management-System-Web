import type { Farm, Species } from '@/types'

export interface UpdateAnimalsBySpecieProps {
	farm: Farm
	species: Species[] & { editable: boolean }[]
}
