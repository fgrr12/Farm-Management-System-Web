import { firestore, signUpAuth } from '@/config/environment'
import dayjs from 'dayjs'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import type { GetEmployeesResponse, SetEmployeeProps } from './types'

const collectionName = 'users'

export module EmployeesService {
	export const getEmployees = async (
		search: string | null,
		farmUuid: string
	): Promise<GetEmployeesResponse[]> => {
		let response = []

		const animalsDocs = await getDocs(
			query(
				collection(firestore, collectionName),
				where('role', 'in', ['employee', 'owner']),
				where('farmUuid', '==', farmUuid),
				where('status', '==', true)
			)
		)
		response = animalsDocs.docs.map((doc) => doc.data()) as GetEmployeesResponse[]

		if (search) {
			response = response.filter(
				(animal) =>
					animal.name.toLowerCase().includes(search.toLowerCase()) ||
					animal.lastName.toLowerCase().includes(search.toLowerCase()) ||
					animal.email.toLowerCase().includes(search.toLowerCase())
			) as GetEmployeesResponse[]
		}
		return response
	}

	export const getEmployee = async (uuid: string): Promise<GetEmployeesResponse> => {
		const document = doc(firestore, collectionName, uuid)
		const employee = await getDoc(document)
		return employee.data() as GetEmployeesResponse
	}

	export const setEmployee = async (data: SetEmployeeProps): Promise<void> => {
		const psw = 'Pass123!'
		const response = await createUserWithEmailAndPassword(signUpAuth, data.email, psw)
		const { user } = response

		const createdAt = dayjs().toISOString()
		const document = doc(firestore, collectionName, user.uid)
		await setDoc(document, { ...data, createdAt, uuid: user.uid })
	}

	export const updateEmployee = async (data: SetEmployeeProps): Promise<void> => {
		const document = doc(firestore, collectionName, data.uuid)
		await setDoc(document, data, { merge: true })
	}

	export const deleteEmployee = async (uuid: string): Promise<void> => {
		const document = doc(firestore, collectionName, uuid)
		await setDoc(document, { status: false }, { merge: true })
	}
}
