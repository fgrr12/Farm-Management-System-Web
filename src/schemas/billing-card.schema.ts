import { z } from 'zod'

export const billingCardSchema = z.object({
	id: z
		.string()
		.min(1, 'billingCard.validation.idRequired')
		.max(50, 'billingCard.validation.idTooLong'),
	name: z
		.string()
		.min(1, 'billingCard.validation.nameRequired')
		.max(100, 'billingCard.validation.nameTooLong'),
	email: z
		.string()
		.min(1, 'billingCard.validation.emailRequired')
		.email('billingCard.validation.emailInvalid'),
	phone: z
		.string()
		.min(1, 'billingCard.validation.phoneRequired')
		.max(20, 'billingCard.validation.phoneTooLong'),
	address: z
		.string()
		.min(1, 'billingCard.validation.addressRequired')
		.max(200, 'billingCard.validation.addressTooLong'),
	uuid: z.string().optional(),
	status: z.boolean().optional(),
})

export type BillingCardFormData = z.infer<typeof billingCardSchema>
