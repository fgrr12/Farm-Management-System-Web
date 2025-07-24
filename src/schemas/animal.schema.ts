import { z } from 'zod'

export const animalSchema = z.object({
	animalId: z
		.string()
		.min(1, 'animal.validation.idRequired')
		.max(50, 'animal.validation.idTooLong'),

	gender: z.enum(['Male', 'Female']),

	speciesUuid: z.string().min(1, 'animal.validation.speciesRequired'),

	breedUuid: z.string().min(1, 'animal.validation.breedRequired'),

	color: z.string().max(100, 'animal.validation.colorTooLong').optional().or(z.literal('')),

	weight: z
		.number()
		.positive('animal.validation.weightPositive')
		.max(10000, 'animal.validation.weightTooHigh')
		.optional()
		.or(z.nan()),

	origin: z.string().max(200, 'animal.validation.originTooLong').optional().or(z.literal('')),

	birthDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'animal.validation.dateFormat')
		.optional()
		.or(z.literal('')),

	purchaseDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'animal.validation.dateFormat')
		.optional()
		.or(z.literal('')),

	soldDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'animal.validation.dateFormat')
		.optional()
		.or(z.literal('')),

	deathDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'animal.validation.dateFormat')
		.optional()
		.or(z.literal('')),

	uuid: z.string().optional(),
	farmUuid: z.string().optional(),
	picture: z.string().optional().or(z.literal('')),
	status: z.boolean().optional(),
})

export const animalSchemaWithRefinements = animalSchema
	.refine(
		(data) => {
			if (data.deathDate && data.birthDate) {
				return new Date(data.deathDate) >= new Date(data.birthDate)
			}
			return true
		},
		{
			message: 'animal.validation.deathAfterBirth',
			path: ['deathDate'],
		}
	)
	.refine(
		(data) => {
			if (data.soldDate && data.birthDate) {
				return new Date(data.soldDate) >= new Date(data.birthDate)
			}
			return true
		},
		{
			message: 'animal.validation.soldAfterBirth',
			path: ['soldDate'],
		}
	)
	.refine(
		(data) => {
			if (data.purchaseDate && data.birthDate) {
				return new Date(data.purchaseDate) >= new Date(data.birthDate)
			}
			return true
		},
		{
			message: 'animal.validation.purchaseAfterBirth',
			path: ['purchaseDate'],
		}
	)

export type AnimalFormData = z.infer<typeof animalSchemaWithRefinements>

export const createAnimalSchema = animalSchemaWithRefinements.omit({ uuid: true })

export const updateAnimalSchema = animalSchemaWithRefinements.extend({
	uuid: z.string().min(1, 'animal.validation.uuidRequired'),
})

export type CreateAnimalData = z.infer<typeof createAnimalSchema>
export type UpdateAnimalData = z.infer<typeof updateAnimalSchema>
