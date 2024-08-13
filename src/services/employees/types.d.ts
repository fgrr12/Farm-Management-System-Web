export interface GetEmployeesResponse {
	uuid: string
	name: string
	lastName: string
	role: string
	phone: string
	email: string
	status: boolean
}

export interface SetEmployeeProps {
	uuid: string
	name: string
	lastName: string
	role: string
	phone: string
	email: string
	status: boolean
}
