import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'

const collectionName = 'species'

const getAllSpecies = async (farmUuid: string) => {
	const queryBase = query(collection(firestore, collectionName), where('farmUuid', '==', farmUuid))
	const speciesDocs = await getDocs(queryBase)
	return speciesDocs.docs.map((doc) => doc.data()) as Species[]
}

const setSpecies = async (speciesData: Species) => {
	const document = doc(firestore, collectionName, speciesData.uuid)
	await setDoc(document, { ...speciesData }, { merge: true })
}

const updateSpecies = async (speciesData: Species) => {
	const document = doc(firestore, collectionName, speciesData.uuid)
	await setDoc(document, { ...speciesData }, { merge: true })
}

const deleteSpecies = async (uuid: string) => {
	const document = doc(firestore, collectionName, uuid)
	await deleteDoc(document)
}

export const SpeciesService = {
	getAllSpecies,
	setSpecies,
	updateSpecies,
	deleteSpecies,
}
