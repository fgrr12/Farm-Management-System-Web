import { z } from 'zod'

export const breedSchema = z.object({
	name: z.string().min(1, 'breed.validation.nameRequired').max(50, 'breed.validation.nameTooLong'),
	gestationPeriod: z
		.number({
			message: 'breed.validation.gestationPeriodInvalid',
		})
		.min(0, 'breed.validation.gestationPeriodMin')
		.max(1000, 'breed.validation.gestationPeriodMax'),
	uuid: z.string().optional(),
	speciesUuid: z.string().optional(),
	farmUuid: z.string().optional(),
})

export type BreedFormData = z.infer<typeof breedSchema>
