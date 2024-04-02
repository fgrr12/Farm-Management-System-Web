import { firestore } from '@/config/environment'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import type { GetAnimalsProps, GetAnimalsResponse } from './types'

const collectionName = 'animals'

export module AnimalsService {
	// Gets

	// This function is responsible for getting all the animals from the database
	export const getAnimals = async (
		getAnimalsProps: GetAnimalsProps
	): Promise<GetAnimalsResponse[]> => {
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

		console.log(response)

		return response as GetAnimalsResponse[]
	}

	// This function is responsible for getting all the species from the database
	export const getSpecies = async (): Promise<string[]> => {
		const animals = await getDocs(collection(firestore, collectionName))
		const species = animals.docs.map((doc) => doc.data().species)
		const uniqueSpecies = Array.from(new Set(species))

		return uniqueSpecies
	}
}
