import { firestore } from '@/config/environment'
import storageHandler from '@/config/persistence/storageHandler'
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore'
import type { GetAnimalProps, GetAnimalResponse, GetAnimalsProps } from './types'

const collectionName = 'animals'

export module AnimalsService {
	// Gets

	// This function is responsible for getting all the animals from the database
	export const getAnimals = async (
		getAnimalsProps: GetAnimalsProps
	): Promise<GetAnimalResponse[]> => {
		const { selectedSpecies, search } = getAnimalsProps
		let response = []

		if (selectedSpecies !== 'all') {
			const animals = await getDocs(
				query(collection(firestore, collectionName), where('species', '==', selectedSpecies))
			)
			response = animals.docs.map((doc) => doc.data())
		} else {
			const animals = await getDocs(
				query(collection(firestore, collectionName), orderBy('animalId'))
			)
			response = animals.docs.map((doc) => ({ ...doc.data(), uuid: doc.id }))
		}

		if (search) {
			response = response.filter((animal) =>
				animal.animalId.toLowerCase().includes(search.toLowerCase())
			)
		}

		return response as GetAnimalResponse[]
	}

	// This function is responsible for getting all the species from the database
	export const getSpecies = async (): Promise<string[]> => {
		const animals = await getDocs(collection(firestore, collectionName))
		const species = animals.docs.map((doc) => doc.data().species)
		const uniqueSpecies = Array.from(new Set(species))

		return uniqueSpecies
	}

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
