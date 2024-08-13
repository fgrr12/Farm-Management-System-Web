import { firestore } from '@/config/environment'
import storageHandler from '@/config/persistence/storageHandler'
import dayjs from 'dayjs'
import {
	collection,
	doc,
	type DocumentData,
	getDoc,
	getDocs,
	query,
	type QuerySnapshot,
	setDoc,
	where,
} from 'firebase/firestore'
import type { GetAnimalResponse, GetAnimalsProps, SetAnimalProps } from './types'

const collectionName = 'animals'

export module AnimalsService {
	// Gets

	export const getAnimals = async (
		getAnimalsProps: GetAnimalsProps
	): Promise<GetAnimalResponse[]> => {
		const { selectedSpecies, search, farmUuid } = getAnimalsProps
		let response = []
		let animals: QuerySnapshot<DocumentData, DocumentData>
		const queryBase = query(
			collection(firestore, collectionName),
			where('status', '==', true),
			where('farmUuid', '==', farmUuid)
		)

		if (selectedSpecies !== 'all') {
			animals = await getDocs(query(queryBase, where('species', '==', selectedSpecies)))
			response = animals.docs.map((doc) => doc.data())
		} else {
			animals = await getDocs(query(queryBase))
		}
		response = animals.docs.map((doc) => doc.data())

		if (search) {
			response = response.filter((animal) =>
				animal.animalId.toLowerCase().includes(search.toLowerCase())
			)
		}

		response = response.sort((a, b) => a.animalId - b.animalId)

		return response as GetAnimalResponse[]
	}

	export const getSpecies = async (farmUuid: string | null): Promise<string[]> => {
		const animals = await getDocs(
			query(
				collection(firestore, collectionName),
				where('status', '==', true),
				where('farmUuid', '==', farmUuid)
			)
		)
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

	export const setAnimal = async (
		animalData: SetAnimalProps,
		createdBy: string | null,
		farmUuid: string | null
	) => {
		if (animalData.picture && !animalData.picture.includes('firebasestorage')) {
			animalData.picture = await savePicture(animalData.uuid, animalData.picture)
		}

		const createdAt = dayjs().toISOString()

		const document = doc(firestore, collectionName, animalData.uuid)
		await setDoc(document, { ...animalData, createdAt, createdBy, farmUuid }, { merge: true })
	}

	// Update

	export const updateAnimal = async (animalData: SetAnimalProps, editedBy: string | null) => {
		if (animalData.picture && !animalData.picture.includes('firebasestorage')) {
			animalData.picture = await savePicture(animalData.uuid, animalData.picture)
		}

		const updateAt = dayjs().toISOString()

		const document = doc(firestore, collectionName, animalData.uuid)
		await setDoc(document, { ...animalData, updateAt, editedBy }, { merge: true })
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
