import { z } from 'zod'

export const taskSchema = z.object({
	title: z
		.string()
		.min(1, 'task.validation.titleRequired')
		.max(100, 'task.validation.titleTooLong'),

	description: z
		.string()
		.min(1, 'task.validation.descriptionRequired')
		.max(500, 'task.validation.descriptionTooLong'),

	priority: z.enum(['low', 'medium', 'high'], {
		message: 'task.validation.priorityRequired',
	}),

	speciesUuid: z.string().min(1, 'task.validation.speciesRequired'),

	uuid: z.string().optional(),
	farmUuid: z.string().optional(),
	status: z.enum(['PENDING', 'COMPLETED']).optional(),
})

export type TaskFormData = z.infer<typeof taskSchema>

export const createTaskSchema = taskSchema.omit({ uuid: true })
export const updateTaskSchema = taskSchema.extend({
	uuid: z.string().min(1, 'task.validation.uuidRequired'),
})

export type CreateTaskData = z.infer<typeof createTaskSchema>
export type UpdateTaskData = z.infer<typeof updateTaskSchema>
