import dayjs from 'dayjs'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'

import { firestore } from '@/config/firebaseConfig'

import type { GetTasksParams } from './types'

const collectionName = 'tasks'

const getTasks = async ({
	farmUuid,
	search,
	status,
	priority,
	speciesUuid,
}: GetTasksParams): Promise<Task[]> => {
	try {
		let response = []
		let queryBase = query(collection(firestore, collectionName), where('farmUuid', '==', farmUuid))

		if (status !== '') queryBase = query(queryBase, where('status', '==', status))
		if (priority !== '') queryBase = query(queryBase, where('priority', '==', priority))
		if (speciesUuid !== '') queryBase = query(queryBase, where('speciesUuid', '==', speciesUuid))

		const tasksDocs = await getDocs(queryBase)
		response = tasksDocs.docs.map((doc) => doc.data()) as Task[]

		if (search) {
			response = response.filter((task) => task.title.toLowerCase().includes(search.toLowerCase()))
		}

		response = response.sort((a, b) => {
			// First sort by priority (high > medium > low)
			const priorityOrder = ['high', 'medium', 'low']
			const priorityDiff = priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)

			if (priorityDiff !== 0) {
				return priorityDiff
			}

			// Then sort by creation date (newest first)
			return dayjs(b.createdAt || b.updatedAt).diff(dayjs(a.createdAt || a.updatedAt))
		})

		return response
	} catch (error) {
		console.error('Error in getTasks:', error)
		return []
	}
}

const setTask = async (task: Task, createdBy: string, farmUuid: string): Promise<void> => {
	const document = doc(firestore, collectionName, task.uuid)
	const createdAt = dayjs().toISOString()
	await setDoc(document, { ...task, createdAt, createdBy, farmUuid }, { merge: true })
}

const updateTaskStatus = async (taskUuid: string, status: string): Promise<void> => {
	const document = doc(firestore, collectionName, taskUuid)
	const updatedAt = dayjs().toISOString()
	await setDoc(document, { status, updatedAt }, { merge: true })
}

export const TasksService = {
	getTasks,
	setTask,
	updateTaskStatus,
}
