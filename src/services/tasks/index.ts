import dayjs from 'dayjs'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'

import { firestore } from '@/config/environment'

import type { GetTasksParams, GetTasksResponse } from './types'

const collectionName = 'tasks'

export module TasksService {
	export const getTasks = async ({
		farmUuid,
		search,
		status,
		priority,
		species,
	}: GetTasksParams): Promise<GetTasksResponse[]> => {
		let response = []
		let queryBase = query(collection(firestore, collectionName), where('farmUuid', '==', farmUuid))

		if (status !== '') queryBase = query(queryBase, where('status', '==', status))

		if (priority !== '') {
			queryBase = query(queryBase, where('priority', '==', priority))
		}

		if (species !== '') {
			queryBase = query(queryBase, where('species', '==', species))
		}

		const tasksDocs = await getDocs(queryBase)
		response = tasksDocs.docs.map((doc) => doc.data()) as GetTasksResponse[]

		if (search) {
			response = response.filter((task) => {
				const searchValue = search.toLowerCase()
				const taskValues = Object.values(task).join(' ').toLowerCase()
				return taskValues.includes(searchValue)
			})
		}

		return response
	}

	export const setTask = async (
		task: GetTasksResponse,
		createdBy: string,
		farmUuid: string
	): Promise<void> => {
		const document = doc(firestore, collectionName, task.uuid)
		const createdAt = dayjs().toISOString()
		await setDoc(document, { ...task, createdAt, createdBy, farmUuid }, { merge: true })
	}

	export const updateTaskStatus = async (taskUuid: string, status: string): Promise<void> => {
		const document = doc(firestore, collectionName, taskUuid)
		const updatedAt = dayjs().toISOString()
		await setDoc(document, { status, updatedAt }, { merge: true })
	}
}
