interface Task {
	uuid: string
	speciesUuid: string
	farmUuid: string
	title: string
	description: string
	status: TaskStatus
	priority: TaskPriority
	assignedTo?: string | null
	dueDate?: string | null
	createdBy?: string | null
	createdAt?: string | null
	updatedAt?: string | null
}

type TaskStatus = 'todo' | 'in-progress' | 'done' | 'archived' | 'overdue'
type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
