import type { AnimalCard } from '@/pages/Animals/Animals.types'
import dayjs from 'dayjs'

export const animalsMock: AnimalCard[] = [
	{
		animalId: crypto.getRandomValues(new Uint32Array(1))[0],
		species: 'Cow',
		breed: 'Angus',
		birthDate: dayjs(),
		gender: 'Male',
		color: 'black',
	},
	{
		animalId: crypto.getRandomValues(new Uint32Array(1))[0],
		species: 'Cow',
		breed: 'Hereford',
		birthDate: dayjs(),
		gender: 'Female',
		color: 'brown',
	},
	{
		animalId: crypto.getRandomValues(new Uint32Array(1))[0],
		species: 'Cow',
		breed: 'Hereford',
		birthDate: dayjs(),
		gender: 'Male',
		color: 'brown',
	},
	{
		animalId: crypto.getRandomValues(new Uint32Array(1))[0],
		species: 'Cow',
		breed: 'Angus',
		birthDate: dayjs(),
		gender: 'Male',
		color: 'black',
	},
	{
		animalId: crypto.getRandomValues(new Uint32Array(1))[0],
		species: 'Cow',
		breed: 'Hereford',
		birthDate: dayjs(),
		gender: 'Female',
		color: 'brown',
	},
]
