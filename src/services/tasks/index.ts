import { callableFireFunction } from '@/utils/callableFireFunction'

import type { GetTasksParams } from './types'

const getTasks = async ({
	farmUuid,
	search,
	status,
	priority,
	speciesUuid,
	assignedTo,
	dueFilter,
	uuid,
}: GetTasksParams): Promise<Task[]> => {
	const response = await callableFireFunction<{ success: boolean; data: Task[]; count: number }>(
		'tasks',
		{
			operation: 'getTasks',
			farmUuid,
			search: search || '',
			status: status || '',
			priority: priority || '',
			speciesUuid: speciesUuid || '',
			assignedTo: assignedTo || '',
			dueFilter,
			uuid,
		}
	)
	return response.data
}

const getTaskStatistics = async (farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean; data: any }>('tasks', {
		operation: 'getTaskStatistics',
		farmUuid,
	})
	return response.data
}

const setTask = async (
	task: Task,
	userUuid: string,
	farmUuid: string
): Promise<{ uuid: string; isNew: boolean }> => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('tasks', {
		operation: 'upsertTask',
		task: { ...task, uuid: undefined }, // Remove uuid for new tasks
		userUuid,
		farmUuid,
	})
	return response.data
}

const updateTask = async (task: Task, userUuid: string, farmUuid: string) => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('tasks', {
		operation: 'upsertTask',
		task,
		userUuid,
		farmUuid,
	})
	return response.data
}

const deleteTask = async (taskUuid: string, userUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('tasks', {
		operation: 'deleteTask',
		taskUuid,
		updatedBy: userUuid,
	})
	return response
}

// Utility function to update task status using updateTask
const updateTaskStatus = async (
	taskUuid: string,
	status: string,
	userUuid: string,
	farmUuid: string
) => {
	// We need to get the task first, then update it
	const tasks = await getTasks({
		farmUuid,
		search: '',
		status: '',
		priority: '',
		speciesUuid: '',
		uuid: taskUuid,
	})
	const task = tasks.find((t) => t.uuid === taskUuid)

	if (!task) {
		throw new Error('Task not found')
	}

	return updateTask({ ...task, status } as Task, userUuid, farmUuid)
}

export const TasksService = {
	getTasks,
	getTaskStatistics,
	setTask,
	updateTask,
	deleteTask,
	updateTaskStatus,
}
