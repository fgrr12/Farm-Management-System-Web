import type { Task } from '@/types'

export interface TaskFilters {
	priority: string
	speciesUuid: string
}

export type TaskColumnId = 'todo' | 'in-progress' | 'done' | 'overdue'

export type TaskColumns = Record<TaskColumnId, Task[]>

export interface TaskColumnInfo {
	id: TaskColumnId
}
