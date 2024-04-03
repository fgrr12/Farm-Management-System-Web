import { firestore } from '@/config/environment'
import dayjs from 'dayjs'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import type { GetHealthRecordResponse, GetHealthRecordsProps, SetHealthRecordProps } from './types'

const collectionName = 'healthRecords'

export module HealthRecordsService {
	// Gets

	export const getHealthRecords = async (
		getHealthRecordsProps: GetHealthRecordsProps
	): Promise<GetHealthRecordResponse[]> => {
		const { animalUuid } = getHealthRecordsProps
		const healthRecords = await getDocs(
			query(collection(firestore, collectionName), where('animalUuid', '==', animalUuid))
		)
		const response = healthRecords.docs.map((doc) => ({ ...doc.data(), uuid: doc.id }))

		return response as GetHealthRecordResponse[]
	}

	// Sets

	export const setHealthRecord = async (healthRecordData: SetHealthRecordProps) => {
		healthRecordData.date = formatDate(healthRecordData.date)

		await addDoc(collection(firestore, collectionName), healthRecordData)
	}

	const formatDate = (date: dayjs.Dayjs | string) => {
		return dayjs(date).format('YYYY-MM-DD')
	}
}
