import { doc, getDoc, setDoc } from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'

const collectionName = 'farms'
export module FarmsService {
	export const getFarm = async (uuid: string): Promise<Farm> => {
		const document = doc(firestore, collectionName, uuid)
		const farm = await getDoc(document)
		return farm.data() as Farm
	}

	export const updateFarm = async (farm: Farm) => {
		const document = doc(firestore, collectionName, farm.uuid)
		await setDoc(document, farm, { merge: true })
	}
}
