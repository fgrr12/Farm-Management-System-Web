export interface GetEmployeesResponse {
	uuid: string
	name: string
	lastName: string
	role: string
	phone: string
	email: string
	status: boolean
	farmUuid: string
	createdBy: string
}

export interface SetEmployeeProps {
	uuid: string
	name: string
	lastName: string
	role: string
	phone: string
	email: string
	status: boolean
	farmUuid: string
	createdBy: string
}
