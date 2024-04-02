import { firestore } from '@/config/environment'
import storageHandler from '@/config/persistence/storageHandler'
import { doc, getDoc } from 'firebase/firestore'
import type { GetAnimalProps, GetAnimalResponse } from './types'

const collectionName = 'animals'

export module AnimalService {
	// Gets

	export const getAnimal = async (getAnimalProps: GetAnimalProps): Promise<GetAnimalResponse> => {
		const { animalUuid } = getAnimalProps
		const docRef = doc(firestore, collectionName, animalUuid)
		const animalDoc = await getDoc(docRef)
		const animalData = animalDoc.data()

		if (animalData?.picture) {
			animalData!.picture = await storageHandler.getPicture(animalData?.picture)
		}

		return animalData as GetAnimalResponse
	}
}
