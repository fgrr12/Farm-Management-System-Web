import dayjs from 'dayjs'
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	setDoc,
	where,
	writeBatch,
} from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'
import storageHandler from '@/config/persistence/storageHandler'

import type { UpdateAnimalsBySpecieProps } from './types'

const collectionName = 'animals'

export module AnimalsService {
	// Gets

	export const getAnimals = async (farmUuid: string | null) => {
		let response = []
		let queryBase = query(
			collection(firestore, collectionName),
			where('status', '==', true),
			where('farmUuid', '==', farmUuid)
		)

		const animalsDocs = await getDocs(queryBase)
		response = animalsDocs.docs
			.map((doc) => doc.data())
			.sort((a, b) => a.animalId - b.animalId) as Animal[]

		return response as Animal[]
	}

	export const getAnimal = async (animalUuid: string): Promise<Animal> => {
		const docRef = doc(firestore, collectionName, animalUuid)
		const animalDoc = await getDoc(docRef)
		const animalData = animalDoc.data()

		return animalData as Animal
	}

	export const getAnimalsBySpecies = async (speciesUuid: string, farmUuid: string | null) => {
		const queryBase = query(
			collection(firestore, collectionName),
			where('status', '==', true),
			where('species.uuid', '==', speciesUuid),
			where('farmUuid', '==', farmUuid)
		)

		const animalsDocs = await getDocs(queryBase)
		return animalsDocs.docs.map((doc) => doc.data()) as Animal[]
	}

	// Sets

	export const setAnimal = async (
		animalData: Animal,
		createdBy: string,
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

	export const updateAnimal = async (animalData: Animal, editedBy: string | null) => {
		if (animalData.picture && !animalData.picture.includes('firebasestorage')) {
			animalData.picture = await savePicture(animalData.uuid, animalData.picture)
		}

		const updateAt = dayjs().toISOString()

		const document = doc(firestore, collectionName, animalData.uuid)
		await setDoc(document, { ...animalData, updateAt, editedBy }, { merge: true })
	}

	export const updateAnimalsBySpecie = async (
		updateAnimalsBySpecieProps: UpdateAnimalsBySpecieProps
	) => {
		const { farm, species } = updateAnimalsBySpecieProps
		const batch = writeBatch(firestore)

		for (const specie of species) {
			if (specie.editable) {
				const animals = await AnimalsService.getAnimalsBySpecies(specie.uuid, farm!.uuid)
				for (const animal of animals) {
					const updatedAnimal = {
						...animal,
						species: {
							uuid: specie.uuid,
							name: specie.name,
						},
						breed: specie.breeds.find((breed) => breed.uuid === animal.breed.uuid)!,
					}
					const document = doc(firestore, collectionName, animal.uuid)
					batch.update(document, updatedAnimal)
				}
			}
		}
		await batch.commit()
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
