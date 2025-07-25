interface Task {
	uuid: string
	speciesUuid: string
	farmUuid: string
	title: string
	description: string
	status: TaskStatus
	priority: TaskPriority
	createdAt?: string
	updatedAt?: string
}

type TaskStatus = 'todo' | 'in-progress' | 'done' | 'archived'
type TaskPriority = 'low' | 'medium' | 'high'
