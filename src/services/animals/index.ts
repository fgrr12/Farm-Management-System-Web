import { auth, firestore } from '@/config/environment'
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
		const user = auth.currentUser
		let response = []

		if (selectedSpecies !== 'all') {
			const animals = await getDocs(
				query(
					collection(firestore, collectionName),
					where('species', '==', selectedSpecies),
					where('status', '==', true),
					where('userId', '==', user?.uid)
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
		if (animalData.picture && !animalData.picture.includes('firebasestorage')) {
			animalData.picture = await savePicture(animalData.uuid, animalData.picture)
		}

		const createdAt = dayjs().toISOString()

		const document = doc(firestore, collectionName, animalData.uuid)
		await setDoc(document, { ...animalData, createdAt }, { merge: true })
	}

	// Update

	export const updateAnimal = async (animalData: SetAnimalProps) => {
		if (animalData.picture && !animalData.picture.includes('firebasestorage')) {
			animalData.picture = await savePicture(animalData.uuid, animalData.picture)
		}

		const updateAt = dayjs().toISOString()

		const document = doc(firestore, collectionName, animalData.uuid)
		await setDoc(document, { ...animalData, updateAt }, { merge: true })
	}

	// Delete

	export const deleteAnimal = async (uuid: string, status: boolean) => {
		const document = doc(firestore, collectionName, uuid)
		const updateAt = dayjs().toISOString()

		await setDoc(document, { status, updateAt }, { merge: true })
	}

	// Constants

	const savePicture = async (uuid: string, picture: string) => {
		const image = await storageHandler.setPicture(`animals/${uuid}`, picture)
		return await storageHandler.getPicture(image.metadata.fullPath)
	}
}
