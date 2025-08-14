import { callableFireFunction } from '@/utils/callableFireFunction'

const upsertSpecies = async (speciesData: Species, userUuid?: string, farmUuid?: string) => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('species', {
		operation: 'upsertSpecies',
		species: speciesData,
		userUuid: userUuid || '',
		farmUuid: farmUuid || speciesData.farmUuid || '',
	})
	return response.data
}

const deleteSpecies = async (speciesUuid: string, userUuid?: string) => {
	const response = await callableFireFunction<{ success: boolean }>('species', {
		operation: 'deleteSpeciesByUuid',
		speciesUuid,
		userUuid: userUuid || '',
	})
	return response
}

export const SpeciesService = {
	upsertSpecies,
	deleteSpecies,
}
