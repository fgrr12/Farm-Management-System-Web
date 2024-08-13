import { firestore } from '@/config/environment'
import { doc, getDoc, setDoc } from 'firebase/firestore'

import type { GetFarmResponse } from './types'

const collectionName = 'farms'
export module FarmsService {
	export const getFarm = async (uuid: string): Promise<GetFarmResponse> => {
		const document = doc(firestore, collectionName, uuid)
		const farm = await getDoc(document)
		return farm.data() as GetFarmResponse
	}

	export const updateFarm = async (farm: GetFarmResponse) => {
		const document = doc(firestore, collectionName, farm.uuid)
		await setDoc(document, farm, { merge: true })
	}
}
