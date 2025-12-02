import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useFarmStore } from '@/store/useFarmStore'

import { TasksService } from '@/services/tasks'
import type { GetTasksParams } from '@/services/tasks/types'

export const TASKS_KEYS = {
	all: ['tasks'] as const,
	list: (params: GetTasksParams) => [...TASKS_KEYS.all, 'list', params] as const,
	statistics: (farmUuid: string) => [...TASKS_KEYS.all, 'statistics', farmUuid] as const,
}

export const useTasks = (params: GetTasksParams) => {
	return useQuery({
		queryKey: TASKS_KEYS.list(params),
		queryFn: () => TasksService.getTasks(params),
		enabled: !!params.farmUuid,
	})
}

export const useTaskStatistics = (farmUuid: string) => {
	return useQuery({
		queryKey: TASKS_KEYS.statistics(farmUuid),
		queryFn: () => TasksService.getTaskStatistics(farmUuid),
		enabled: !!farmUuid,
	})
}

export const useCreateTask = () => {
	const queryClient = useQueryClient()
	const { farm } = useFarmStore()

	return useMutation({
		mutationFn: ({ task, userUuid }: { task: Task; userUuid: string }) =>
			TasksService.setTask(task, userUuid, farm?.uuid || ''),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TASKS_KEYS.all })
		},
	})
}

export const useUpdateTask = () => {
	const queryClient = useQueryClient()
	const { farm } = useFarmStore()

	return useMutation({
		mutationFn: ({ task, userUuid }: { task: Task; userUuid: string }) =>
			TasksService.updateTask(task, userUuid, farm?.uuid || ''),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TASKS_KEYS.all })
		},
	})
}

export const useDeleteTask = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ taskUuid, userUuid }: { taskUuid: string; userUuid: string }) =>
			TasksService.deleteTask(taskUuid, userUuid),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TASKS_KEYS.all })
		},
	})
}
