import { firestore } from '@/config/environment'
import storageHandler from '@/config/persistence/storageHandler'
import dayjs from 'dayjs'
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import type { GetAnimalResponse, GetAnimalsProps, SetAnimalProps } from './types'

const collectionName = 'animals'

export module AnimalsService {
	// Gets

	export const getAnimals = async (
		getAnimalsProps: GetAnimalsProps
	): Promise<GetAnimalResponse[]> => {
		const { speciesUuid, search, farmUuid } = getAnimalsProps
		let response = []
		let queryBase = query(
			collection(firestore, collectionName),
			where('status', '==', true),
			where('farmUuid', '==', farmUuid)
		)

		if (speciesUuid) queryBase = query(queryBase, where('species.uuid', '==', speciesUuid))

		const animalsDocs = await getDocs(queryBase)
		response = animalsDocs.docs
			.map((doc) => doc.data())
			.sort((a, b) => a.animalId - b.animalId) as GetAnimalResponse[]

		if (search) {
			response = response.filter((animal) =>
				animal.animalId.toString().includes(search.toLowerCase())
			)
		}

		return response as GetAnimalResponse[]
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
