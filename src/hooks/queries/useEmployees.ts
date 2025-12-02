import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { EmployeesService } from '@/services/employees'

export const EMPLOYEES_KEYS = {
	all: ['employees'] as const,
	list: (farmUuid: string) => [...EMPLOYEES_KEYS.all, 'list', farmUuid] as const,
	detail: (employeeUuid: string) => [...EMPLOYEES_KEYS.all, 'detail', employeeUuid] as const,
}

export const useEmployees = (farmUuid: string) => {
	return useQuery({
		queryKey: EMPLOYEES_KEYS.list(farmUuid),
		queryFn: () => EmployeesService.getEmployees(farmUuid),
		enabled: !!farmUuid,
	})
}

export const useEmployee = (employeeUuid: string) => {
	return useQuery({
		queryKey: EMPLOYEES_KEYS.detail(employeeUuid),
		queryFn: () => EmployeesService.getEmployee(employeeUuid),
		enabled: !!employeeUuid,
	})
}

export const useCreateEmployee = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ employee, userUuid }: { employee: User; userUuid: string }) =>
			EmployeesService.setEmployee(employee, userUuid),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEYS.list(variables.employee.farmUuid) })
		},
	})
}

export const useUpdateEmployee = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ employee, userUuid }: { employee: User; userUuid: string }) =>
			EmployeesService.updateEmployee(employee, userUuid),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: EMPLOYEES_KEYS.detail(variables.employee.uuid || ''),
			})
			queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEYS.list(variables.employee.farmUuid) })
		},
	})
}

export const useDeleteEmployee = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ employeeUuid, userUuid }: { employeeUuid: string; userUuid: string }) =>
			EmployeesService.deleteEmployee(employeeUuid, userUuid),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEYS.all })
		},
	})
}
