import { callableFireFunction } from '@/utils/callableFireFunction'

const getEmployees = async (farmUuid: string): Promise<User[]> => {
	const response = await callableFireFunction<{ success: boolean; data: User[]; count: number }>(
		'users',
		{
			operation: 'getEmployees',
			farmUuid,
		}
	)
	return response.data
}

const getEmployee = async (employeeUuid: string): Promise<User> => {
	const response = await callableFireFunction<{ success: boolean; data: User }>('users', {
		operation: 'getEmployeeByUuid',
		employeeUuid,
	})
	return response.data
}

const setEmployee = async (
	employee: User,
	userUuid: string
): Promise<{ uuid: string; isNew: boolean }> => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('users', {
		operation: 'upsertEmployee',
		employee: { ...employee, uuid: undefined }, // Remove uuid for new employees
		userUuid,
	})
	return response.data
}

const updateEmployee = async (employee: User, userUuid: string) => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('users', {
		operation: 'upsertEmployee',
		employee,
		userUuid,
	})
	return response.data
}

const deleteEmployee = async (employeeUuid: string, userUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('users', {
		operation: 'updateEmployeeStatus',
		employeeUuid,
		userUuid,
	})
	return response
}

export const EmployeesService = {
	getEmployees,
	getEmployee,
	setEmployee,
	updateEmployee,
	deleteEmployee,
}
