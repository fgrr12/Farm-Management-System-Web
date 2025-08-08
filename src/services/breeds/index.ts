import { deleteDoc, doc } from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'

import { callableFireFunction } from '@/utils/callableFireFunction'

const FUNCTIONS = {
	getAllBreeds: 'getAllBreeds',
	setBreed: 'setBreed',
	updateBreed: 'updateBreed',
	deleteBreedsBySpeciesUuid: 'deleteBreedsBySpeciesUuid',
} as const

const getAllBreeds = async (farmUuid: string) => {
	return await callableFireFunction(FUNCTIONS.getAllBreeds, { farmUuid })
}

const createBreed = async (breed: Breed) => {
	return await callableFireFunction(FUNCTIONS.setBreed, { breed })
}
const updateBreed = async (breed: Breed, updatedBy: string) => {
	return await callableFireFunction(FUNCTIONS.updateBreed, { breed, updatedBy })
}
const deleteBreedsBySpeciesUuid = async (speciesUuid: string) => {
	return await callableFireFunction(FUNCTIONS.deleteBreedsBySpeciesUuid, {
		speciesUuid,
	})
}

const collectionName = 'breeds'

const deleteBreed = async (uuid: string) => {
	const document = doc(firestore, collectionName, uuid)
	await deleteDoc(document)
}

export const BreedsService = {
	getAllBreeds,
	createBreed,
	updateBreed,
	deleteBreedsBySpeciesUuid,
	deleteBreed,
}
