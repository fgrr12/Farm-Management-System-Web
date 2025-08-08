import { callableFireFunction } from '@/utils/callableFireFunction'

const FUNCTIONS = {
	getAnimalsByFarm: 'getAnimalsByFarm',
	getAnimalByUuid: 'getAnimalByUuid',
	getAnimalsBySpeciesUuid: 'getAnimalsBySpeciesUuid',
	setAnimal: 'setAnimal',
	updateAnimal: 'updateAnimal',
	updateAnimalStatus: 'updateAnimalStatus',
} as const

// Gets

const getAnimals = async (farmUuid: string): Promise<Animal[]> => {
	return await callableFireFunction(FUNCTIONS.getAnimalsByFarm, { farmUuid })
}

const getAnimal = async (animalUuid: string): Promise<Animal> => {
	return await callableFireFunction(FUNCTIONS.getAnimalByUuid, { animalUuid })
}

const getAnimalsBySpecies = async (speciesUuid: string, farmUuid: string): Promise<Animal[]> => {
	return await callableFireFunction(FUNCTIONS.getAnimalsBySpeciesUuid, { speciesUuid, farmUuid })
}

// Sets

const setAnimal = async (animal: Animal, createdBy: string, farmUuid: string): Promise<String> => {
	return await callableFireFunction(FUNCTIONS.setAnimal, { animal, createdBy, farmUuid })
}

// Update

const updateAnimal = async (animal: Animal, updatedBy: string) => {
	return await callableFireFunction(FUNCTIONS.updateAnimal, { animal, updatedBy })
}

const updateAnimalStatus = async (animalUuid: string, updatedBy: string) => {
	return await callableFireFunction(FUNCTIONS.updateAnimalStatus, { animalUuid, updatedBy })
}

export const AnimalsService = {
	getAnimals,
	getAnimal,
	getAnimalsBySpecies,
	setAnimal,
	updateAnimal,
	updateAnimalStatus,
}
