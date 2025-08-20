import { z } from 'zod'

export const taxDetailsSchema = z.object({
	id: z
		.string()
		.min(1, 'taxDetails.validation.idRequired')
		.max(50, 'taxDetails.validation.idTooLong'),
	name: z
		.string()
		.min(1, 'taxDetails.validation.nameRequired')
		.max(100, 'taxDetails.validation.nameTooLong'),
	email: z
		.string()
		.min(1, 'taxDetails.validation.emailRequired')
		.email('taxDetails.validation.emailInvalid'),
	phone: z
		.string()
		.min(1, 'taxDetails.validation.phoneRequired')
		.max(20, 'taxDetails.validation.phoneTooLong'),
	address: z
		.string()
		.min(1, 'taxDetails.validation.addressRequired')
		.max(200, 'taxDetails.validation.addressTooLong'),
	activityCode: z
		.string()
		.min(1, 'taxDetails.validation.activityCodeRequired')
		.max(20, 'taxDetails.validation.activityCodeTooLong'),
	uuid: z.string().optional(),
	status: z.boolean().optional(),
})

export type TaxDetailsFormData = z.infer<typeof taxDetailsSchema>
