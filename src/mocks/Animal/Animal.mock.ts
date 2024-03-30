import type { IAnimal } from '@/pages/Animal/Animal.types'
import dayjs from 'dayjs'

export const AnimalMock: IAnimal = {
	animalId: 1,
	species: 'Cow',
	breed: 'Angus',
	gender: 'Male',
	color: 'Black',
	weight: 1500,
	picture: 'https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg',
	relatedAnimal: [
		{
			animalId: 2,
			species: 'Cow',
			breed: 'Angus',
			gender: 'Male',
			relation: 'Father',
		},
		{
			animalId: 3,
			species: 'Cow',
			breed: 'Angus',
			gender: 'Female',
			relation: 'Mother',
		},
	],
	healthRecords: [
		{
			animalId: 1,
			reason: 'Annual Checkup',
			notes: 'Everything looks good',
			type: 'Checkup',
			reviewedBy: 'Dr. Smith',
			date: dayjs(),
			weight: 1500,
			temperature: 101,
			heartRate: 60,
			bloodPressure: 120,
			medication: 'None',
			dosage: 'None',
			frequency: 'None',
			duration: 'None',
		},
	],
	birthDate: dayjs(),
	purchaseDate: dayjs(),
}
