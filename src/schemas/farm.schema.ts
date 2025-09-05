import { z } from 'zod'

export const farmSchema = z.object({
	name: z.string().min(1, 'farm.validation.nameRequired').max(100, 'farm.validation.nameTooLong'),
	address: z
		.string()
		.min(1, 'farm.validation.addressRequired')
		.max(200, 'farm.validation.addressTooLong'),
	liquidUnit: z.enum(['L', 'Gal'], {
		message: 'farm.validation.liquidUnitRequired',
	}),
	weightUnit: z.enum(['Kg', 'P'], {
		message: 'farm.validation.weightUnitRequired',
	}),
	temperatureUnit: z.enum(['°C', '°F'], {
		message: 'farm.validation.temperatureUnitRequired',
	}),
	language: z.enum(['eng', 'spa'], {
		message: 'farm.validation.languageRequired',
	}),
	uuid: z.string().optional(),
	taxDetailsUuid: z.string().optional(),
	status: z.boolean().optional(),
})

export type FarmFormData = z.infer<typeof farmSchema>
