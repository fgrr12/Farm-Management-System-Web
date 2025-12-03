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

		// OPTIMISTIC UPDATE: Update UI immediately
		onMutate: async ({ task }) => {
			// Cancel any outgoing refetches to avoid overwriting optimistic update
			await queryClient.cancelQueries({ queryKey: TASKS_KEYS.all })

			// Snapshot all task list queries for rollback
			const previousQueries: Array<{ queryKey: unknown[]; data: unknown }> = []
			queryClient.getQueriesData({ queryKey: TASKS_KEYS.all }).forEach(([queryKey, data]) => {
				previousQueries.push({ queryKey: queryKey as unknown[], data })
			})

			// Optimistically update all task list caches
			queryClient.setQueriesData({ queryKey: TASKS_KEYS.all }, (old: Task[] | undefined) => {
				if (!old || !Array.isArray(old)) return old
				return old.map((t) => (t.uuid === task.uuid ? { ...t, ...task } : t))
			})

			// Return context with snapshot for rollback
			return { previousQueries }
		},

		// ROLLBACK: If mutation fails, revert to previous state
		onError: (_err, _variables, context) => {
			if (context?.previousQueries) {
				context.previousQueries.forEach(({ queryKey, data }) => {
					queryClient.setQueryData(queryKey as unknown[], data)
				})
			}
		},

		// SYNC: Always refetch to ensure consistency with server
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: TASKS_KEYS.all })
		},
	})
}

export const useDeleteTask = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ taskUuid, userUuid }: { taskUuid: string; userUuid: string }) =>
			TasksService.deleteTask(taskUuid, userUuid),

		// OPTIMISTIC UPDATE: Remove from UI immediately
		onMutate: async ({ taskUuid }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: TASKS_KEYS.all })

			// Snapshot all task list queries for rollback
			const previousQueries: Array<{ queryKey: unknown[]; data: unknown }> = []
			queryClient.getQueriesData({ queryKey: TASKS_KEYS.all }).forEach(([queryKey, data]) => {
				previousQueries.push({ queryKey: queryKey as unknown[], data })
			})

			// Optimistically remove from all task list caches
			queryClient.setQueriesData({ queryKey: TASKS_KEYS.all }, (old: Task[] | undefined) => {
				if (!old || !Array.isArray(old)) return old
				return old.filter((t) => t.uuid !== taskUuid)
			})

			// Return context with snapshot for rollback
			return { previousQueries }
		},

		// ROLLBACK: If mutation fails, restore the deleted task
		onError: (_err, _variables, context) => {
			if (context?.previousQueries) {
				context.previousQueries.forEach(({ queryKey, data }) => {
					queryClient.setQueryData(queryKey as string[], data)
				})
			}
		},

		// SYNC: Always refetch to ensure consistency with server
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: TASKS_KEYS.all })
		},
	})
}
