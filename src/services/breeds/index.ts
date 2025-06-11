import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'

const collectionName = 'breeds'

const getBreeds = async (farmUuid: string) => {
	const queryBase = query(collection(firestore, collectionName), where('farmUuid', '==', farmUuid))
	const breedsDocs = await getDocs(queryBase)
	return breedsDocs.docs.map((doc) => doc.data()) as Breed[]
}

const setBreed = async (breedData: Breed) => {
	const document = doc(firestore, collectionName, breedData.uuid)
	await setDoc(document, { ...breedData }, { merge: true })
}

const updateBreed = async (breedData: Breed) => {
	const document = doc(firestore, collectionName, breedData.uuid)
	await setDoc(document, { ...breedData }, { merge: true })
}

const deleteBreed = async (uuid: string) => {
	const document = doc(firestore, collectionName, uuid)
	await deleteDoc(document)
}

export const BreedsService = {
	getBreeds,
	setBreed,
	updateBreed,
	deleteBreed,
}
