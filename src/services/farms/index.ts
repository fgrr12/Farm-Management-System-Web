import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'

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

const getAllFarms = async (): Promise<Farm[]> => {
	const collectionRef = collection(firestore, collectionName)
	const snapshot = await getDocs(collectionRef)
	return snapshot.docs.map((doc) => doc.data() as Farm)
}

const createFarm = async (farmData: Omit<Farm, 'uuid'>): Promise<Farm> => {
	const uuid = crypto.randomUUID()
	const newFarm: Farm = {
		...farmData,
		uuid,
	}
	const document = doc(firestore, collectionName, uuid)
	await setDoc(document, newFarm)
	return newFarm
}

export const FarmsService = {
	getFarm,
	updateFarm,
	getAllFarms,
	createFarm,
}
