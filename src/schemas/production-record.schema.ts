import { z } from 'zod'

export const productionRecordSchema = z.object({
	quantity: z
		.number({
			message: 'productionRecord.validation.quantityInvalid',
		})
		.positive('productionRecord.validation.quantityPositive')
		.max(10000, 'productionRecord.validation.quantityTooHigh'),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'productionRecord.validation.dateFormat'),
	notes: z
		.string()
		.min(1, 'productionRecord.validation.notesRequired')
		.max(500, 'productionRecord.validation.notesTooLong'),
	uuid: z.string().optional(),
	animalUuid: z.string().optional(),
	status: z.boolean().optional(),
})

export type ProductionRecordFormData = z.infer<typeof productionRecordSchema>
