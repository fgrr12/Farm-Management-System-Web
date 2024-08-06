import { firestore } from '@/config/environment'
import storageHandler from '@/config/persistence/storageHandler'
import dayjs from 'dayjs'
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import type { GetAnimalResponse, GetAnimalsProps, SetAnimalProps } from './types'

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
				query(
					collection(firestore, collectionName),
					where('species', '==', selectedSpecies),
					where('status', '==', true)
				)
			)
			response = animals.docs.map((doc) => doc.data())
		} else {
			const animals = await getDocs(
				query(collection(firestore, collectionName), where('status', '==', true))
			)
			response = animals.docs.map((doc) => ({ ...doc.data(), uuid: doc.id })) as GetAnimalResponse[]
		}

		if (search) {
			response = response.filter((animal) =>
				animal.animalId.toLowerCase().includes(search.toLowerCase())
			)
		}

		response = response.sort((a, b) => a.animalId - b.animalId)

		return response as GetAnimalResponse[]
	}

	// This function is responsible for getting all the species from the database
	export const getSpecies = async (): Promise<string[]> => {
		const animals = await getDocs(collection(firestore, collectionName))
		const species = animals.docs.map((doc) => doc.data().species)
		const uniqueSpecies = Array.from(new Set(species))

		return uniqueSpecies
	}

	export const getAnimal = async (animalUuid: string): Promise<GetAnimalResponse> => {
		const docRef = doc(firestore, collectionName, animalUuid)
		const animalDoc = await getDoc(docRef)
		const animalData = animalDoc.data()

		return animalData as GetAnimalResponse
	}

	// Sets

	export const setAnimal = async (animalData: SetAnimalProps) => {
		if (animalData.picture) {
			const image = await storageHandler.setPicture(
				`animals/${animalData.uuid}`,
				animalData.picture
			)
			animalData.picture = await storageHandler.getPicture(image.metadata.fullPath)
		}

		if (animalData.birthDate) {
			animalData.birthDate = formatDate(animalData.birthDate)
		}

		if (animalData.purchaseDate) {
			animalData.purchaseDate = formatDate(animalData.purchaseDate)
		}

		if (animalData.soldDate) {
			animalData.soldDate = formatDate(animalData.soldDate)
		}

		if (animalData.deathDate) {
			animalData.deathDate = formatDate(animalData.deathDate)
		}

		const createdAt = dayjs().toISOString()

		const document = doc(firestore, collectionName, animalData.uuid)
		await setDoc(document, { ...animalData, createdAt }, { merge: true })
	}

	// Update

	export const updateAnimal = async (animalData: SetAnimalProps) => {
		const document = doc(firestore, collectionName, animalData.uuid)
		const updateAt = dayjs().toISOString()

		await setDoc(document, { status: animalData.status, updateAt }, { merge: true })
	}

	// Delete

	export const deleteAnimal = async (uuid: string, status: boolean) => {
		const document = doc(firestore, collectionName, uuid)
		const updateAt = dayjs().toISOString()

		await setDoc(document, { status, updateAt }, { merge: true })
	}
}

const formatDate = (date: dayjs.Dayjs | string) => {
	return dayjs(date).toISOString()
}
