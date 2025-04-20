import type { RelatedAnimalInformation } from '@/pages/RelatedAnimalsForm/RelatedAnimalsForm.types'

export interface ExternalRelationFormProps {
	currentAnimal: RelatedAnimalInformation
}

export interface ExternalRelation {
	animalId: string
	breed: Breed
	gender: Gender
	relation: 'Parent' | 'Child'
}
