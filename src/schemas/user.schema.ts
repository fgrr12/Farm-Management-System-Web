import { z } from 'zod'

export const userSchema = z.object({
	name: z.string().min(1, 'user.validation.nameRequired').max(50, 'user.validation.nameTooLong'),
	lastName: z
		.string()
		.min(1, 'user.validation.lastNameRequired')
		.max(50, 'user.validation.lastNameTooLong'),
	email: z.string().min(1, 'user.validation.emailRequired').email('user.validation.emailInvalid'),
	phone: z.string().min(1, 'user.validation.phoneRequired').max(20, 'user.validation.phoneTooLong'),
	language: z.enum(['spa', 'eng'], {
		message: 'user.validation.languageRequired',
	}),
	uuid: z.string().optional(),
	farmUuid: z.string().optional(),
	role: z.enum(['employee', 'owner', 'admin']).optional(),
	status: z.boolean().optional(),
	photoUrl: z.string().optional(),
})

export type UserFormData = z.infer<typeof userSchema>
