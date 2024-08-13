import { firestore } from '@/config/environment'
import { doc, getDoc } from 'firebase/firestore'

import type { GetFarmResponse } from './types'

const collectionName = 'farms'
export module FarmsService {
	export const getFarm = async (uuid: string): Promise<GetFarmResponse> => {
		const document = doc(firestore, collectionName, uuid)
		const farm = await getDoc(document)
		return farm.data() as GetFarmResponse
	}
}
