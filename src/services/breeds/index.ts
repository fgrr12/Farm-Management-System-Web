import { callableFireFunction } from '@/utils/callableFireFunction'

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
	createBreed,
	updateBreed,
	deleteBreed,
	deleteBreedsBySpeciesUuid,
}
