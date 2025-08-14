export interface TaskFilters {
	priority: string
	speciesUuid: string
}

export interface TaskColumns {
	todo: Task[]
	'in-progress': Task[]
	done: Task[]
}

export interface TaskColumnInfo {
	id: 'todo' | 'in-progress' | 'done'
	title: string
	color: string
	bgColor: string
}
