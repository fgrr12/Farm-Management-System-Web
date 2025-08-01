import { z } from 'zod'

export const healthRecordSchema = z.object({
	reason: z
		.string()
		.min(1, 'healthRecord.validation.reasonRequired')
		.max(100, 'healthRecord.validation.reasonTooLong'),
	type: z.enum(
		[
			'',
			'Checkup',
			'Vaccination',
			'Medication',
			'Surgery',
			'Pregnancy',
			'Deworming',
			'Birth',
			'Drying',
		],
		{
			message: 'healthRecord.validation.typeRequired',
		}
	),
	reviewedBy: z
		.string()
		.min(1, 'healthRecord.validation.reviewedByRequired')
		.max(100, 'healthRecord.validation.reviewedByTooLong'),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'healthRecord.validation.dateFormat'),
	weight: z.number().optional(),
	temperature: z.number().optional(),
	medication: z.string().optional(),
	dosage: z.string().optional(),
	frequency: z.string().optional(),
	duration: z.string().optional(),
	notes: z
		.string()
		.min(1, 'healthRecord.validation.notesRequired')
		.max(500, 'healthRecord.validation.notesTooLong'),
	manualHealthStatus: z.enum(['healthy', 'sick', 'treatment', 'critical', 'unknown']).optional(),
	uuid: z.string().optional(),
	animalUuid: z.string().optional(),
	createdBy: z.string().optional(),
	status: z.boolean().optional(),
})

export type HealthRecordFormData = z.infer<typeof healthRecordSchema>
