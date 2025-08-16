import { callableFireFunction } from '@/utils/callableFireFunction'

// Gets

const getProductionRecords = async (
	animalUuid: string,
	limit?: number
): Promise<ProductionRecord[]> => {
	const response = await callableFireFunction<{
		success: boolean
		data: ProductionRecord[]
		count: number
	}>('production', {
		operation: 'getProductionRecords',
		animalUuid,
		limit: limit || 50,
	})
	return response.data
}

const getProductionRecord = async (productionRecordUuid: string): Promise<ProductionRecord> => {
	const response = await callableFireFunction<{ success: boolean; data: ProductionRecord }>(
		'production',
		{
			operation: 'getProductionRecordByUuid',
			productionRecordUuid,
		}
	)
	return response.data
}

// Sets

const setProductionRecord = async (
	productionRecord: ProductionRecord,
	userUuid: string,
	farmUuid?: string
): Promise<{ uuid: string; isNew: boolean }> => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('production', {
		operation: 'upsertProductionRecord',
		productionRecord: { ...productionRecord, uuid: undefined }, // Remove uuid for new production records
		userUuid,
		farmUuid: farmUuid || '',
	})
	return response.data
}

// Update

const updateProductionRecord = async (
	productionRecord: ProductionRecord,
	userUuid: string,
	farmUuid?: string
) => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('production', {
		operation: 'upsertProductionRecord',
		productionRecord,
		userUuid,
		farmUuid: farmUuid || '',
	})
	return response.data
}

const updateProductionRecordStatus = async (productionRecordUuid: string, userUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('production', {
		operation: 'updateProductionRecordStatus',
		productionRecordUuid,
		userUuid,
	})
	return response
}

export const ProductionRecordsService = {
	getProductionRecords,
	getProductionRecord,
	setProductionRecord,
	updateProductionRecord,
	updateProductionRecordStatus,
}
