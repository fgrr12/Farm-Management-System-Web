import dayjs from 'dayjs'
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'
import storageHandler from '@/config/persistence/storageHandler'

import {
	calculateHealthStatusFromRecords,
	getLastHealthCheckDate,
} from '@/utils/healthStatusUpdater'

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
		.sort((a, b) => {
			// First sort by health status priority (critical/sick first, then others)
			const healthStatusPriority: Record<HealthStatus, number> = {
				critical: 1,
				sick: 2,
				treatment: 3,
				unknown: 4,
				healthy: 5,
			}

			const aPriority = healthStatusPriority[a.healthStatus as HealthStatus] || 6
			const bPriority = healthStatusPriority[b.healthStatus as HealthStatus] || 6

			if (aPriority !== bPriority) {
				return aPriority - bPriority
			}

			// Then sort by animalId descending (newest first)
			return b.animalId - a.animalId
		}) as Animal[]

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

// Update specific fields (for health status updates)
const updateAnimalFields = async (animalUuid: string, fields: Partial<Animal>) => {
	const updateAt = dayjs().toISOString()
	const document = doc(firestore, collectionName, animalUuid)
	await setDoc(document, { ...fields, updateAt }, { merge: true })
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

// Get animals with enriched health data
const getAnimalsWithHealthStatus = async (farmUuid: string | null) => {
	const animals = await getAnimals(farmUuid)

	return animals.map((animal) => ({
		...animal,
		// Ensure healthStatus exists, calculate if missing
		healthStatus:
			animal.healthStatus ||
			calculateHealthStatusFromRecords(animal.healthRecords || [], undefined, animal),
		lastHealthCheck: getLastHealthCheckDate(animal.healthRecords),
		hasActiveIssues: hasActiveHealthIssues(animal.healthRecords),
	}))
}

// Get all animals (for migration purposes)
const getAllAnimals = async (): Promise<Animal[]> => {
	const queryBase = query(collection(firestore, collectionName), where('status', '==', true))
	const animalsDocs = await getDocs(queryBase)
	return animalsDocs.docs.map((doc) => doc.data()) as Animal[]
}

// Helper function to check for active health issues
const hasActiveHealthIssues = (healthRecords?: HealthRecord[]): boolean => {
	if (!healthRecords?.length) return false

	const recentRecords = healthRecords
		.filter((record) => record.status)
		.filter((record) => {
			const daysSince = Math.floor(
				(Date.now() - new Date(record.date).getTime()) / (1000 * 60 * 60 * 24)
			)
			return daysSince <= 30 // Last 30 days
		})

	return recentRecords.some(
		(record) =>
			record.medication ||
			record.type === 'Surgery' ||
			record.type === 'Medication' ||
			(record.temperature && (record.temperature > 39.5 || record.temperature < 37.5))
	)
}

export const AnimalsService = {
	getAnimals,
	getAnimal,
	getAnimalsBySpecies,
	getAnimalsWithHealthStatus,
	getAllAnimals,
	setAnimal,
	updateAnimal,
	updateAnimalFields,
	deleteAnimal,
}
