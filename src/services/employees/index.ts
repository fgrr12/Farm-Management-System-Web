import { auth, firestore } from '@/config/environment'
import dayjs from 'dayjs'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, doc, getDocs, query, setDoc } from 'firebase/firestore'
import type { GetEmployeesResponse, SetEmployeeProps } from './types'

const collectionName = 'employees'

export module EmployeesService {
	export const getEmployees = async (search: string | null): Promise<GetEmployeesResponse[]> => {
		let response = []

		const animalsDocs = await getDocs(query(collection(firestore, collectionName)))

		if (search) {
			response = animalsDocs.docs
				.map((doc) => doc.data())
				.filter((animal) =>
					animal.name.toLowerCase().includes(search.toLowerCase())
				) as GetEmployeesResponse[]
		} else {
			response = animalsDocs.docs.map((doc) => doc.data()) as GetEmployeesResponse[]
		}
		return response
	}

	export const setEmployee = async (
		data: SetEmployeeProps,
		createdBy: string | null
	): Promise<void> => {
		const document = doc(firestore, collectionName, data.uuid)

		await createUserWithEmailAndPassword(auth, data.email, 'Pass123!')

		const createdAt = dayjs().toISOString()

		await setDoc(document, { ...data, createdBy, createdAt })
	}
}
