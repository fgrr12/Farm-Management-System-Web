import { vi } from 'vitest'

export const mockAnimalsService = {
	AnimalsService: {
		getAnimals: vi.fn().mockResolvedValue([
			{
				uuid: 'animal-1',
				animalId: 'A001',
				breed: 'Angus',
				gender: 'F',
			},
			{
				uuid: 'animal-2',
				animalId: 'A002',
				breed: 'Hereford',
				gender: 'M',
			},
		]),
	},
}
