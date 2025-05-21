import dayjs from 'dayjs'
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'

import { firestore } from '@/config/environment'

const collectionName = 'productionRecords'

export module ProductionRecordsService {
	// Gets

	export const getProductionRecords = async (animalUuid: string): Promise<ProductionRecord[]> => {
		const productionRecords = await getDocs(
			query(
				collection(firestore, collectionName),
				where('animalUuid', '==', animalUuid),
				where('status', '==', true)
			)
		)
		const response = productionRecords.docs.map((doc) => ({ ...doc.data(), uuid: doc.id }))

		return response as ProductionRecord[]
	}

	export const getProductionRecord = async (uuid: string): Promise<ProductionRecord> => {
		const document = doc(firestore, collectionName, uuid)
		const productionRecord = await getDoc(document)

		return productionRecord.data() as ProductionRecord
	}

	// Sets

	export const setProductionRecord = async (
		productionRecordData: ProductionRecord,
		createdBy: string | null
	) => {
		productionRecordData.date = formatDate(productionRecordData.date)
		const createdAt = dayjs().toISOString()

		const document = doc(firestore, collectionName, productionRecordData.uuid)
		await setDoc(document, { ...productionRecordData, createdAt, createdBy }, { merge: true })
	}

	// Update

	export const updateProductionRecord = async (
		productionRecordData: ProductionRecord,
		updatedBy: string | null
	) => {
		productionRecordData.date = formatDate(productionRecordData.date)
		const updateAt = dayjs().toISOString()

		const document = doc(firestore, collectionName, productionRecordData.uuid)
		await setDoc(document, { ...productionRecordData, updateAt, updatedBy }, { merge: true })
	}

	// Delete

	export const updateProductionRecordsStatus = async (uuid: string, status: boolean) => {
		const document = doc(firestore, collectionName, uuid)
		const updateAt = dayjs().toISOString()

		await setDoc(document, { status, updateAt }, { merge: true })
	}
}

const formatDate = (date: dayjs.Dayjs | string) => {
	return dayjs(date).toISOString()
}
