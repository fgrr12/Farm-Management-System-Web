import { z } from 'zod'

export const employeeSchema = z.object({
	name: z
		.string()
		.min(1, 'employee.validation.nameRequired')
		.max(50, 'employee.validation.nameTooLong'),

	lastName: z
		.string()
		.min(1, 'employee.validation.lastNameRequired')
		.max(50, 'employee.validation.lastNameTooLong'),

	email: z
		.string()
		.min(1, 'employee.validation.emailRequired')
		.email('employee.validation.emailInvalid')
		.max(100, 'employee.validation.emailTooLong'),

	phone: z
		.string()
		.min(1, 'employee.validation.phoneRequired')
		.max(20, 'employee.validation.phoneTooLong'),

	role: z.enum(['employee', 'owner', 'admin'], {
		message: 'employee.validation.roleRequired',
	}),

	uuid: z.string().optional(),
	farmUuid: z.string().optional(),
	status: z.boolean().optional(),
	photoUrl: z.string().optional(),
	language: z.string().optional(),
	createdBy: z.string().optional(),
})

export type EmployeeFormData = z.infer<typeof employeeSchema>

export const createEmployeeSchema = employeeSchema.omit({ uuid: true })
export const updateEmployeeSchema = employeeSchema.extend({
	uuid: z.string().min(1, 'employee.validation.uuidRequired'),
})

export type CreateEmployeeData = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeData = z.infer<typeof updateEmployeeSchema>
