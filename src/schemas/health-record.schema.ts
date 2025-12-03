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
			'HoofCare',
			'Castration',
			'Dehorning',
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
	weight: z.number().optional().nullable(),
	temperature: z.number().optional().nullable(),
	medication: z.string().optional().nullable(),
	dosage: z.string().optional().nullable(),
	frequency: z.string().optional().nullable(),
	duration: z.string().optional().nullable(),
	notes: z
		.string()
		.min(1, 'healthRecord.validation.notesRequired')
		.max(500, 'healthRecord.validation.notesTooLong'),
	manualHealthStatus: z.enum(['healthy', 'sick', 'treatment', 'critical', 'unknown']).optional(),
	uuid: z.string().optional(),
	animalUuid: z.string().optional(),
	createdBy: z.string().optional(),
	status: z.boolean().optional(),
	// New fields
	withdrawalDays: z.number().optional().nullable(),
	withdrawalEndDate: z.string().optional().nullable(),
	administrationRoute: z
		.enum(['IM', 'SC', 'Oral', 'Topical', 'Intramammary', 'IV', 'Intrauterine', 'Other'])
		.optional()
		.nullable(),
	injectionSite: z
		.enum(['Neck', 'Rump', 'Leg', 'Ear', 'Flank', 'Tail', 'Other'])
		.optional()
		.nullable(),
	batchNumber: z.string().optional().nullable(),
	manufacturer: z.string().optional().nullable(),
	technician: z.string().optional().nullable(),
})

export type HealthRecordFormData = z.infer<typeof healthRecordSchema>
