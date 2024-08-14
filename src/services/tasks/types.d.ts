export interface GetTasksResponse extends Task {}

export interface GetTasksParams {
	search: string
	status: string
	priority: string
	species: string
	farmUuid: string
}
