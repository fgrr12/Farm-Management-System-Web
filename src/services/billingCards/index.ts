import { doc, getDoc, setDoc } from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'

const collectionName = 'billingCards'

const getBillingCard = async (uuid: string) => {
	const document = doc(firestore, collectionName, uuid)
	const billingCard = await getDoc(document)
	return billingCard.data() as BillingCard
}

const setBillingCard = async (billingCardData: BillingCard) => {
	const document = doc(firestore, collectionName, billingCardData.uuid)
	await setDoc(document, { ...billingCardData }, { merge: true })
}

const updateBillingCard = async (billingCardData: BillingCard) => {
	const document = doc(firestore, collectionName, billingCardData.uuid)
	await setDoc(document, { ...billingCardData }, { merge: true })
}

export const BillingCardsService = {
	getBillingCard,
	setBillingCard,
	updateBillingCard,
}
