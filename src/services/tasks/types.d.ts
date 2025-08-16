export interface GetTasksParams {
	search: string
	status: string
	priority: string
	speciesUuid: string
	farmUuid: string
	assignedTo?: string
	dueFilter?: string
	uuid?: string
}
