import { firestore } from '@/config/environment'
import dayjs from 'dayjs'
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore'

import type { GetRelatedAnimalsResponse, SetRelatedAnimalProps } from './types'

const collectionName = 'relatedAnimals'

export module RelatedAnimalsService {
	// Gets

	export const getRelatedAnimals = async (
		animalUuid: string
	): Promise<GetRelatedAnimalsResponse[]> => {
		const parentsDocs = await getDocs(
			query(collection(firestore, collectionName), where('parent.animalUuid', '==', animalUuid))
		)
		const childrenDocs = await getDocs(
			query(collection(firestore, collectionName), where('child.animalUuid', '==', animalUuid))
		)
		const parentsResponse = parentsDocs.docs.map((doc) => ({ ...doc.data(), uuid: doc.id }))
		const childrenResponse = childrenDocs.docs.map((doc) => ({ ...doc.data(), uuid: doc.id }))

		return [...parentsResponse, ...childrenResponse] as GetRelatedAnimalsResponse[]
	}

	// Sets

	export const setRelatedAnimal = async (relatedAnimalData: SetRelatedAnimalProps) => {
		const { uuid, parent, child } = relatedAnimalData
		const createdAt = dayjs().format()

		const relatedAnimalDocument = doc(firestore, collectionName, uuid)
		await setDoc(relatedAnimalDocument, { uuid, parent, child, createdAt })
	}

	// Delete

	export const deleteRelatedAnimal = async (uuid: string) => {
		const relatedAnimalDocument = doc(firestore, collectionName, uuid)
		await deleteDoc(relatedAnimalDocument)
	}
}
