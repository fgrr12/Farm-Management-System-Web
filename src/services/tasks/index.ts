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

	response = response.sort(
		(a, b) =>
			dayjs(b.createdAt).diff(dayjs(a.createdAt)) &&
			['high', 'medium', 'low'].indexOf(a.priority) - ['high', 'medium', 'low'].indexOf(b.priority)
	)

	return response
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
