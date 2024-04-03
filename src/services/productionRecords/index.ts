import { firestore } from '@/config/environment'
import dayjs from 'dayjs'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import type {
	GetProductionRecordResponse,
	GetProductionRecordsProps,
	SetProductionRecordProps,
} from './types'

const collectionName = 'productionRecords'

export module ProductionRecordsService {
	// Gets

	export const getProductionRecords = async (
		getProductionRecordsProps: GetProductionRecordsProps
	): Promise<GetProductionRecordResponse[]> => {
		const { animalUuid } = getProductionRecordsProps
		const productionRecords = await getDocs(
			query(collection(firestore, collectionName), where('animalUuid', '==', animalUuid))
		)
		const response = productionRecords.docs.map((doc) => ({ ...doc.data(), uuid: doc.id }))

		return response as GetProductionRecordResponse[]
	}

	// Sets

	export const setProductionRecord = async (productionRecordData: SetProductionRecordProps) => {
		productionRecordData.date = formatDate(productionRecordData.date)

		const document = doc(firestore, collectionName, productionRecordData.uuid)
		await setDoc(document, productionRecordData, { merge: true })
	}

	const formatDate = (date: dayjs.Dayjs | string) => {
		return dayjs(date).format('YYYY-MM-DD')
	}
}
