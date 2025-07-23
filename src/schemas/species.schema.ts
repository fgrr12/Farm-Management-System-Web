import { z } from 'zod'

export const speciesSchema = z.object({
	name: z
		.string()
		.min(1, 'species.validation.nameRequired')
		.max(50, 'species.validation.nameTooLong'),
	uuid: z.string().optional(),
	farmUuid: z.string().optional(),
})

export type SpeciesFormData = z.infer<typeof speciesSchema>
