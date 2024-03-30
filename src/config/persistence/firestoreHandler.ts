import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { firestore } from '../environment'

// Gets
const getCollection = async (collectionName: string) => {
	const collectionRef = await getDocs(collection(firestore, collectionName))
	return collectionRef.docs.map((doc) => ({ ...doc.data(), uuid: doc.id }))
}

const getDocument = async (collectionName: string, documentId: string) => {
	const docRef = doc(firestore, collectionName, documentId)
	const docSnap = await getDoc(docRef)
	console.log(docSnap.id)

	return docSnap.data()
}

// Sets
const setDocument = async (collectionName: string, documentId: string, data: any) => {
	const document = doc(firestore, collectionName, documentId)
	await setDoc(document, data)
}

// Updates
const updateDocument = async (collectionName: string, documentId: string, data: any) => {
	const document = doc(firestore, collectionName, documentId)
	await setDoc(document, data, { merge: true })
}

// Deletes
const deleteDocument = async (collectionName: string, documentId: string) => {
	const document = doc(firestore, collectionName, documentId)
	await setDoc(document, { deleted: true }, { merge: true })
}

export default {
	deleteDocument,
	getCollection,
	getDocument,
	setDocument,
	updateDocument,
}
