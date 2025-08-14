interface Task {
	uuid: string
	speciesUuid: string
	farmUuid: string
	title: string
	description: string
	status: TaskStatus
	priority: TaskPriority
	assignedTo?: string
	dueDate?: string
	createdBy?: string
	createdAt?: string
	updatedAt?: string
}

type TaskStatus = 'todo' | 'in-progress' | 'done' | 'archived' | 'overdue'
type TaskPriority = 'low' | 'medium' | 'high'
