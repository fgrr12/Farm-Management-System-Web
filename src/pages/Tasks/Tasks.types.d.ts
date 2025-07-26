export interface TaskFilters {
	priority: string
	speciesUuid: string
}

export interface TaskColumns {
	todo: Task[]
	'in-progress': Task[]
	done: Task[]
	archived: Task[]
}

export interface TaskColumnInfo {
	id: TaskStatus
	title: string
	color: string
	bgColor: string
}
