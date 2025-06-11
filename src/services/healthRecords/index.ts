import dayjs from 'dayjs'
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'

import { AnimalsService } from '../animals'
import { BreedsService } from '../breeds'

const collectionName = 'healthRecords'

// Gets

const getHealthRecords = async (animalUuid: string): Promise<HealthRecord[]> => {
	const healthRecords = await getDocs(
		query(
			collection(firestore, collectionName),
			where('animalUuid', '==', animalUuid),
			where('status', '==', true)
		)
	)
	const response = healthRecords.docs
		.map((doc) => ({ ...doc.data() }))
		.sort((a, b) => {
			return dayjs(b.date).diff(dayjs(a.date))
		})

	return response as HealthRecord[]
}

const getHealthRecord = async (uuid: string): Promise<HealthRecord> => {
	const document = doc(firestore, collectionName, uuid)
	const healthRecord = await getDoc(document)

	return healthRecord.data() as HealthRecord
}

// Sets

const setHealthRecord = async (healthRecordData: HealthRecord, createdBy: string) => {
	healthRecordData.date = formatDate(healthRecordData.date)
	const createdAt = dayjs().toISOString()

	const document = doc(firestore, collectionName, healthRecordData.uuid)
	await setDoc(document, { ...healthRecordData, createdAt, createdBy }, { merge: true })

	if (healthRecordData.type === 'Pregnancy') {
		const dbAnimal = await AnimalsService.getAnimal(healthRecordData.animalUuid)
		const dbBreed = await BreedsService.getBreed(dbAnimal.breedUuid)

		let date = dayjs(healthRecordData.date).add(dbBreed.gestationPeriod, 'days')
		setHealthRecordGiveBirth(healthRecordData.animalUuid, createdBy, date.toString())
		setHealthRecordDrying(healthRecordData.animalUuid, createdBy, date.add(7, 'month').toString())
	}

	if (healthRecordData.type === 'Birth') {
		const date = dayjs().add(7, 'month').toString()
		setHealthRecordDrying(healthRecordData.animalUuid, createdBy, date.toString())
	}
}

const setHealthRecordGiveBirth = async (animalUuid: string, createdBy: string, date: string) => {
	const healthRecordData: HealthRecord = {
		reason: 'Posible fecha de nacimiento',
		type: 'Birth',
		date,
		reviewedBy: '',
		createdBy,
		weight: 0,
		temperature: 0,
		medication: '',
		dosage: '',
		frequency: '',
		duration: '',
		notes: '',
		animalUuid,
		uuid: crypto.randomUUID(),
		status: true,
	}
	const createdAt = dayjs().toISOString()

	const document = doc(firestore, collectionName, healthRecordData.uuid)
	await setDoc(document, { ...healthRecordData, createdAt }, { merge: true })
}

const setHealthRecordDrying = async (animalUuid: string, createdBy: string, date: string) => {
	const healthRecordData: HealthRecord = {
		reason: 'Posible fecha de secado',
		type: 'Drying',
		date,
		reviewedBy: '',
		createdBy,
		weight: 0,
		temperature: 0,
		medication: '',
		dosage: '',
		frequency: '',
		duration: '',
		notes: '',
		animalUuid,
		uuid: crypto.randomUUID(),
		status: true,
	}
	const createdAt = dayjs().toISOString()

	const document = doc(firestore, collectionName, healthRecordData.uuid)
	await setDoc(document, { ...healthRecordData, createdAt }, { merge: true })
}

// Update

const updateHealthRecord = async (healthRecordData: HealthRecord, editedBy: string | null) => {
	healthRecordData.date = formatDate(healthRecordData.date)
	const updateAt = dayjs().toISOString()

	const document = doc(firestore, collectionName, healthRecordData.uuid)
	await setDoc(document, { ...healthRecordData, updateAt, editedBy }, { merge: true })
}

// Delete

const updateHealthRecordsStatus = async (uuid: string, status: boolean) => {
	const document = doc(firestore, collectionName, uuid)
	const updateAt = dayjs().toISOString()

	await setDoc(document, { status, updateAt }, { merge: true })
}

// Constants

const formatDate = (date: dayjs.Dayjs | string) => {
	return dayjs(date).toISOString()
}

export const HealthRecordsService = {
	getHealthRecords,
	getHealthRecord,
	setHealthRecord,
	updateHealthRecord,
	updateHealthRecordsStatus,
}
