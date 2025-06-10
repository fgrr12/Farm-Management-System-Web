import { doc, getDoc, setDoc } from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'

const collectionName = 'farms'

const getFarm = async (uuid: string): Promise<Farm> => {
	const document = doc(firestore, collectionName, uuid)
	const farm = await getDoc(document)
	return farm.data() as Farm
}

const updateFarm = async (farm: Farm) => {
	const document = doc(firestore, collectionName, farm.uuid)
	await setDoc(document, farm, { merge: true })
}

export const FarmsService = {
	getFarm,
	updateFarm,
}
