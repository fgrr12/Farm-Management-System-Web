import { callableFireFunction } from '@/utils/callableFireFunction'

const getFarm = async (farmUuid: string): Promise<Farm> => {
	const response = await callableFireFunction<{ success: boolean; data: Farm }>('farms', {
		operation: 'getFarmByUuid',
		farmUuid,
	})
	return response.data
}

const updateFarm = async (farm: Farm, userUuid: string) => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('farms', {
		operation: 'upsertFarm',
		farm,
		userUuid,
	})
	return response.data
}

const getAllFarms = async (): Promise<Farm[]> => {
	const response = await callableFireFunction<{ success: boolean; data: Farm[]; count: number }>(
		'farms',
		{
			operation: 'getAllFarms',
		}
	)
	return response.data
}

const createFarm = async (
	farmData: Omit<Farm, 'uuid'>,
	userUuid: string
): Promise<{ uuid: string; isNew: boolean }> => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('farms', {
		operation: 'upsertFarm',
		farm: { ...farmData, uuid: undefined }, // Remove uuid for new farms
		userUuid,
	})
	return response.data
}

const updateFarmStatus = async (farmUuid: string, updatedBy: string) => {
	const response = await callableFireFunction<{ success: boolean }>('farms', {
		operation: 'updateFarmStatus',
		farmUuid,
		updatedBy,
	})
	return response
}

export const FarmsService = {
	getFarm,
	updateFarm,
	getAllFarms,
	createFarm,
	updateFarmStatus,
}
