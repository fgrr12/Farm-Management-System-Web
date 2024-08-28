import { firestore } from '@/config/environment'
import dayjs from 'dayjs'
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import type { GetHealthRecordResponse, SetHealthRecordProps } from './types'

const collectionName = 'healthRecords'

export module HealthRecordsService {
	// Gets

	export const getHealthRecords = async (
		animalUuid: string
	): Promise<GetHealthRecordResponse[]> => {
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

		return response as GetHealthRecordResponse[]
	}

	export const getHealthRecord = async (uuid: string): Promise<GetHealthRecordResponse> => {
		const document = doc(firestore, collectionName, uuid)
		const healthRecord = await getDoc(document)

		return healthRecord.data() as GetHealthRecordResponse
	}

	// Sets

	export const setHealthRecord = async (
		healthRecordData: SetHealthRecordProps,
		createdBy: string | null
	) => {
		healthRecordData.date = formatDate(healthRecordData.date)
		const createdAt = dayjs().toISOString()

		const document = doc(firestore, collectionName, healthRecordData.uuid)
		await setDoc(document, { ...healthRecordData, createdAt, createdBy }, { merge: true })

		if (healthRecordData.type === 'Pregnancy') {
			setHealthRecordGiveBirth(healthRecordData.animalUuid, createdBy)
		}

		if (healthRecordData.type === 'Birth') {
			setHealthRecordDrying(healthRecordData.animalUuid, createdBy)
		}
	}

	const setHealthRecordGiveBirth = async (animalUuid: string, createdBy: string | null) => {
		const healthRecordData: SetHealthRecordProps = {
			reason: 'Posible fecha de nacimiento',
			type: 'Birth',
			date: dayjs().add(279, 'days').toISOString(),
			reviewedBy: '',
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
		await setDoc(document, { ...healthRecordData, createdAt, createdBy }, { merge: true })
	}

	const setHealthRecordDrying = async (animalUuid: string, createdBy: string | null) => {
		const healthRecordData: SetHealthRecordProps = {
			reason: 'Posible fecha de secado',
			type: 'Drying',
			date: dayjs().add(9, 'month').toISOString(),
			reviewedBy: '',
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
		await setDoc(document, { ...healthRecordData, createdAt, createdBy }, { merge: true })
	}

	// Update

	export const updateHealthRecord = async (
		healthRecordData: SetHealthRecordProps,
		editedBy: string | null
	) => {
		healthRecordData.date = formatDate(healthRecordData.date)
		const updateAt = dayjs().toISOString()

		const document = doc(firestore, collectionName, healthRecordData.uuid)
		await setDoc(document, { ...healthRecordData, updateAt, editedBy }, { merge: true })
	}

	// Delete

	export const updateHealthRecordsStatus = async (uuid: string, status: boolean) => {
		const document = doc(firestore, collectionName, uuid)
		const updateAt = dayjs().toISOString()

		await setDoc(document, { status, updateAt }, { merge: true })
	}
}

const formatDate = (date: dayjs.Dayjs | string) => {
	return dayjs(date).toISOString()
}
