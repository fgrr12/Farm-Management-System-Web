import { callableFireFunction } from '@/utils/callableFireFunction'

// Gets

const getAnimals = async (farmUuid: string): Promise<Animal[]> => {
	const response = await callableFireFunction<{ success: boolean; data: Animal[]; count: number }>(
		'animals',
		{
			operation: 'getAnimalsByFarm',
			farmUuid,
		}
	)
	return response.data
}

const getAnimal = async (animalUuid: string): Promise<Animal> => {
	const response = await callableFireFunction<{ success: boolean; data: Animal }>('animals', {
		operation: 'getAnimalByUuid',
		animalUuid,
	})
	return response.data
}

const getAnimalsBySpecies = async (speciesUuid: string, farmUuid: string): Promise<Animal[]> => {
	const response = await callableFireFunction<{ success: boolean; data: Animal[]; count: number }>(
		'animals',
		{
			operation: 'getAnimalsBySpeciesUuid',
			speciesUuid,
			farmUuid,
		}
	)
	return response.data
}

// Sets

const setAnimal = async (animal: Animal, createdBy: string, farmUuid: string): Promise<string> => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('animals', {
		operation: 'upsertAnimal',
		animal: { ...animal, uuid: undefined }, // Remove uuid for new animals
		userUuid: createdBy,
		farmUuid,
	})
	return response.data.uuid
}

// Update

const updateAnimal = async (animal: Animal, updatedBy: string) => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('animals', {
		operation: 'upsertAnimal',
		animal,
		userUuid: updatedBy,
		farmUuid: animal.farmUuid,
	})
	return response.data
}

const updateAnimalStatus = async (animalUuid: string, updatedBy: string) => {
	const response = await callableFireFunction<{ success: boolean }>('animals', {
		operation: 'updateAnimalStatus',
		animalUuid,
		updatedBy,
	})
	return response
}

const updateAnimalHealthStatus = async (
	animalUuid: string,
	healthStatus: HealthStatus,
	updatedBy: string
) => {
	const response = await callableFireFunction<{ success: boolean }>('animals', {
		operation: 'updateAnimalHealthStatus',
		animalUuid,
		healthStatus,
		userUuid: updatedBy,
	})
	return response
}

// Bulk Operations

const loadAnimalWithDetails = async (animalUuid: string): Promise<Animal> => {
	const response = await callableFireFunction<{ success: boolean; data: Animal }>('animals', {
		operation: 'loadAnimalWithDetails',
		animalUuid,
	})
	return response.data
}

export const AnimalsService = {
	getAnimals,
	getAnimal,
	getAnimalsBySpecies,
	setAnimal,
	updateAnimal,
	updateAnimalStatus,
	updateAnimalHealthStatus,
	loadAnimalWithDetails,
}
