import { callableFireFunction } from '@/utils/callableFireFunction'

const getAllBreeds = async (farmUuid: string): Promise<Breed[]> => {
	const response = await callableFireFunction<{ success: boolean; data: Breed[]; count: number }>(
		'breeds',
		{
			operation: 'getAllBreeds',
			farmUuid,
		}
	)
	return response.data
}

const getBreed = async (breedUuid: string): Promise<Breed> => {
	const response = await callableFireFunction<{ success: boolean; data: Breed }>('breeds', {
		operation: 'getBreedByUuid',
		breedUuid,
	})
	return response.data
}

const createBreed = async (
	breed: Breed,
	userUuid: string,
	farmUuid: string
): Promise<{ uuid: string; isNew: boolean }> => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('breeds', {
		operation: 'upsertBreed',
		breed: { ...breed, uuid: undefined }, // Remove uuid for new breeds
		userUuid,
		farmUuid,
	})
	return response.data
}

const updateBreed = async (breed: Breed, userUuid: string, farmUuid: string) => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('breeds', {
		operation: 'upsertBreed',
		breed,
		userUuid,
		farmUuid,
	})
	return response.data
}

const deleteBreed = async (breedUuid: string, updatedBy: string) => {
	const response = await callableFireFunction<{ success: boolean }>('breeds', {
		operation: 'deleteBreedByUuid',
		breedUuid,
		updatedBy,
	})
	return response
}

const deleteBreedsBySpeciesUuid = async (speciesUuid: string, updatedBy: string) => {
	const response = await callableFireFunction<{ success: boolean }>('breeds', {
		operation: 'deleteBreedsBySpeciesUuid',
		speciesUuid,
		updatedBy,
	})
	return response
}

export const BreedsService = {
	getAllBreeds,
	getBreed,
	createBreed,
	updateBreed,
	deleteBreed,
	deleteBreedsBySpeciesUuid,
}
