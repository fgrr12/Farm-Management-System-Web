import { firestore } from '@/config/environment'
import dayjs from 'dayjs'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import type { GetHealthRecordResponse, GetHealthRecordsProps, SetHealthRecordProps } from './types'

const collectionName = 'healthRecords'

export module HealthRecordsService {
	// Gets

	export const getHealthRecords = async (
		getHealthRecordsProps: GetHealthRecordsProps
	): Promise<GetHealthRecordResponse[]> => {
		const { animalUuid } = getHealthRecordsProps
		const healthRecords = await getDocs(
			query(
				collection(firestore, collectionName),
				where('animalUuid', '==', animalUuid),
				where('status', '==', true)
			)
		)
		const response = healthRecords.docs.map((doc) => ({ ...doc.data() }))

		return response as GetHealthRecordResponse[]
	}

	// Sets

	export const setHealthRecord = async (healthRecordData: SetHealthRecordProps) => {
		healthRecordData.date = formatDate(healthRecordData.date)

		const document = doc(firestore, collectionName, healthRecordData.uuid)
		await setDoc(document, healthRecordData, { merge: true })
	}

	const formatDate = (date: dayjs.Dayjs | string) => {
		return dayjs(date).format('YYYY-MM-DD')
	}

	// Update

	export const updateHealthRecordsStatus = async (uuid: string, status: boolean) => {
		const document = doc(firestore, collectionName, uuid)
		await setDoc(document, { status }, { merge: true })
	}
}
