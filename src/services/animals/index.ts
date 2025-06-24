import dayjs from 'dayjs'
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'
import storageHandler from '@/config/persistence/storageHandler'

const collectionName = 'animals'

// Gets

const getAnimals = async (farmUuid: string | null) => {
	let response = []
	let queryBase = query(
		collection(firestore, collectionName),
		where('status', '==', true),
		where('farmUuid', '==', farmUuid)
	)

	const animalsDocs = await getDocs(queryBase)
	response = animalsDocs.docs
		.map((doc) => doc.data())
		.sort((a, b) => b.animalId - a.animalId) as Animal[]

	return response as Animal[]
}

const getAnimal = async (animalUuid: string): Promise<Animal> => {
	const docRef = doc(firestore, collectionName, animalUuid)
	const animalDoc = await getDoc(docRef)
	const animalData = animalDoc.data()

	return animalData as Animal
}

const getAnimalsBySpecies = async (speciesUuid: string, farmUuid: string | null) => {
	const queryBase = query(
		collection(firestore, collectionName),
		where('status', '==', true),
		where('speciesUuid', '==', speciesUuid),
		where('farmUuid', '==', farmUuid)
	)

	const animalsDocs = await getDocs(queryBase)
	return animalsDocs.docs.map((doc) => doc.data()) as Animal[]
}

// Sets

const setAnimal = async (animalData: Animal, createdBy: string, farmUuid: string | null) => {
	if (animalData.picture && !animalData.picture.includes('firebasestorage')) {
		animalData.picture = await savePicture(animalData.uuid, animalData.picture)
	}

	const createdAt = dayjs().toISOString()

	const document = doc(firestore, collectionName, animalData.uuid)
	await setDoc(document, { ...animalData, createdAt, createdBy, farmUuid }, { merge: true })
}

// Update

const updateAnimal = async (animalData: Animal, editedBy: string | null) => {
	if (animalData.picture && !animalData.picture.includes('firebasestorage')) {
		animalData.picture = await savePicture(animalData.uuid, animalData.picture)
	}

	const updateAt = dayjs().toISOString()

	const document = doc(firestore, collectionName, animalData.uuid)
	await setDoc(document, { ...animalData, updateAt, editedBy }, { merge: true })
}

// Delete

const deleteAnimal = async (uuid: string, status: boolean) => {
	const document = doc(firestore, collectionName, uuid)
	const updateAt = dayjs().toISOString()

	await setDoc(document, { status, updateAt }, { merge: true })
}

// Constants

const savePicture = async (uuid: string, picture: string) => {
	const image = await storageHandler.setPicture(`animals/${uuid}`, picture)
	return await storageHandler.getPicture(image.metadata.fullPath)
}

export const AnimalsService = {
	getAnimals,
	getAnimal,
	getAnimalsBySpecies,
	setAnimal,
	updateAnimal,
	deleteAnimal,
}
