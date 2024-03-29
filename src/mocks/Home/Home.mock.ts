import type { Animal } from '@/pages/Animals/Animals.types'
import dayjs from 'dayjs'

export const animalsMock: Animal[] = [
	{
		animalId: crypto.getRandomValues(new Uint32Array(1))[0],
		animalKind: 'Cow',
		animalBreed: 'Angus',
		animalBirthDate: dayjs(),
		animalGender: 'Male',
		animalColor: 'black',
	},
	{
		animalId: crypto.getRandomValues(new Uint32Array(1))[0],
		animalKind: 'Cow',
		animalBreed: 'Hereford',
		animalBirthDate: dayjs(),
		animalGender: 'Female',
		animalColor: 'brown',
	},
	{
		animalId: crypto.getRandomValues(new Uint32Array(1))[0],
		animalKind: 'Cow',
		animalBreed: 'Hereford',
		animalBirthDate: dayjs(),
		animalGender: 'Male',
		animalColor: 'brown',
	},
	{
		animalId: crypto.getRandomValues(new Uint32Array(1))[0],
		animalKind: 'Cow',
		animalBreed: 'Angus',
		animalBirthDate: dayjs(),
		animalGender: 'Male',
		animalColor: 'black',
	},
	{
		animalId: crypto.getRandomValues(new Uint32Array(1))[0],
		animalKind: 'Cow',
		animalBreed: 'Hereford',
		animalBirthDate: dayjs(),
		animalGender: 'Female',
		animalColor: 'brown',
	},
]
