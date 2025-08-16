import { collection, onSnapshot, query, where } from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'

import { callableFireFunction } from '@/utils/callableFireFunction'

const collectionName = 'relatedAnimals'

// Gets

const getRelatedAnimals = async (animalUuid: string): Promise<Relation[]> => {
	const response = await callableFireFunction<{
		success: boolean
		data: Relation[]
		count: number
	}>('relations', {
		operation: 'getRelatedAnimals',
		animalUuid,
	})
	return response.data
}

const getOrganizedRelatedAnimals = async (animalUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('relations', {
		operation: 'getOrganizedRelatedAnimals',
		animalUuid,
	})
	return response.data
}

const getRelationByUuid = async (relationUuid: string): Promise<Relation> => {
	const response = await callableFireFunction<{ success: boolean; data: Relation }>('relations', {
		operation: 'getRelationByUuid',
		relationUuid,
	})
	return response.data
}

const getRealTimeRelatedAnimals = (
	animalUuid: string,
	onUpdate: (data: Relation[]) => void,
	onError: (error: any) => void
) => {
	let parents: Relation[] = []
	let children: Relation[] = []

	const parentsQuery = query(
		collection(firestore, collectionName),
		where('child.animalUuid', '==', animalUuid)
	)
	const childrenQuery = query(
		collection(firestore, collectionName),
		where('parent.animalUuid', '==', animalUuid)
	)

	const parentsUnsubscribe = onSnapshot(
		parentsQuery,
		(snapshot) => {
			parents = snapshot.docs.map((doc) => ({ ...doc.data() })) as Relation[]
			onUpdate([...parents, ...children])
		},
		(error) => onError(error)
	)

	const childrenUnsubscribe = onSnapshot(
		childrenQuery,
		(snapshot) => {
			children = snapshot.docs.map((doc) => ({ ...doc.data() })) as Relation[]
			onUpdate([...parents, ...children])
		},
		(error) => onError(error)
	)

	return () => {
		parentsUnsubscribe()
		childrenUnsubscribe()
	}
}

// Sets

const setRelatedAnimal = async (
	relation: Omit<Relation, 'uuid'>,
	userUuid: string,
	farmUuid: string
): Promise<{ uuid: string; isNew: boolean }> => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('relations', {
		operation: 'upsertRelation',
		relation: { ...relation }, // Remove uuid for new relations
		userUuid,
		farmUuid,
	})
	return response.data
}

const updateRelatedAnimal = async (relation: Relation, userUuid: string, farmUuid: string) => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('relations', {
		operation: 'upsertRelation',
		relation,
		userUuid,
		farmUuid,
	})
	return response.data
}

// Delete

const deleteRelatedAnimal = async (relationUuid: string, userUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('relations', {
		operation: 'deleteRelation',
		relationUuid,
		userUuid,
	})
	return response
}

export const RelatedAnimalsService = {
	getRelatedAnimals,
	getOrganizedRelatedAnimals,
	getRelationByUuid,
	getRealTimeRelatedAnimals,
	setRelatedAnimal,
	updateRelatedAnimal,
	deleteRelatedAnimal,
}
