import type { Task, TaskStatus } from '@/types'

export interface TaskColumnProps {
	status: TaskStatus
	title: string
	tasks: Task[]
	onSearch?: (search: string) => void
	onTaskClick?: (task: Task) => void
}
