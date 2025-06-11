import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'

const collectionName = 'breeds'

const getAllBreeds = async (farmUuid: string) => {
	const queryBase = query(collection(firestore, collectionName), where('farmUuid', '==', farmUuid))
	const breedsDocs = await getDocs(queryBase)
	return breedsDocs.docs.map((doc) => doc.data()) as Breed[]
}

const upsertBreed = async (breedData: Breed) => {
	const document = doc(firestore, collectionName, breedData.uuid)
	await setDoc(document, { ...breedData }, { merge: true })
}

const deleteBreed = async (uuid: string) => {
	const document = doc(firestore, collectionName, uuid)
	await deleteDoc(document)
}

const deleteBreedsBySpecie = async (specieUuid: string) => {
	const queryBase = query(
		collection(firestore, collectionName),
		where('speciesUuid', '==', specieUuid)
	)
	const breedsDocs = await getDocs(queryBase)
	for (const breed of breedsDocs.docs) {
		await deleteDoc(breed.ref)
	}
}

export const BreedsService = {
	getAllBreeds,
	upsertBreed,
	deleteBreed,
	deleteBreedsBySpecie,
}
