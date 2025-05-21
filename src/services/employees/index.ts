import dayjs from 'dayjs'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'

import { firestore, signUpAuth } from '@/config/environment'

const collectionName = 'users'

export module EmployeesService {
	export const getEmployees = async (search: string | null, farmUuid: string): Promise<User[]> => {
		let response = []

		const employeesDocs = await getDocs(
			query(
				collection(firestore, collectionName),
				where('role', 'in', ['employee', 'owner']),
				where('farmUuid', '==', farmUuid),
				where('status', '==', true)
			)
		)
		response = employeesDocs.docs.map((doc) => doc.data()) as User[]

		if (search) {
			response = response.filter(
				(employee) =>
					employee.name.toLowerCase().includes(search.toLowerCase()) ||
					employee.lastName.toLowerCase().includes(search.toLowerCase()) ||
					employee.email.toLowerCase().includes(search.toLowerCase())
			) as User[]
		}
		return response
	}

	export const getEmployee = async (uuid: string): Promise<User> => {
		const document = doc(firestore, collectionName, uuid)
		const employee = await getDoc(document)
		return employee.data() as User
	}

	export const setEmployee = async (data: User): Promise<void> => {
		const temporal_psw = 'Pass123!'
		const response = await createUserWithEmailAndPassword(signUpAuth, data.email, temporal_psw)
		const { user } = response

		const createdAt = dayjs().toISOString()
		const document = doc(firestore, collectionName, user.uid)
		await setDoc(document, { ...data, createdAt, uuid: user.uid })
	}

	export const updateEmployee = async (data: User): Promise<void> => {
		const document = doc(firestore, collectionName, data.uuid)
		await setDoc(document, data, { merge: true })
	}

	export const deleteEmployee = async (uuid: string): Promise<void> => {
		const document = doc(firestore, collectionName, uuid)
		await setDoc(document, { status: false }, { merge: true })
	}
}
