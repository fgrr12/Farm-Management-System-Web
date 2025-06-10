import { getDownloadURL, ref, uploadString } from 'firebase/storage'

import { storage } from '../firebaseConfig'

// Gets
const getPicture = async (path: string) => {
	const storageRef = ref(storage, path)

	const url = await getDownloadURL(storageRef)

	return url
}

// Sets
const setPicture = async (path: string, imageBase64: string) => {
	const storageRef = ref(storage, path)

	const snapshot = uploadString(storageRef, imageBase64, 'base64', {
		contentType: 'image/jpeg',
	})

	return snapshot
}

export default {
	getPicture,
	setPicture,
}
