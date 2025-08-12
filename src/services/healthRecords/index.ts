import { callableFireFunction } from '@/utils/callableFireFunction'

// Gets

const getHealthRecords = async (animalUuid: string, limit?: number): Promise<HealthRecord[]> => {
	const response = await callableFireFunction<{
		success: boolean
		data: HealthRecord[]
		count: number
	}>('health', {
		operation: 'getHealthRecords',
		animalUuid,
		limit: limit || 50,
	})
	return response.data
}

const getHealthRecord = async (healthRecordUuid: string): Promise<HealthRecord> => {
	const response = await callableFireFunction<{ success: boolean; data: HealthRecord }>('health', {
		operation: 'getHealthRecordByUuid',
		healthRecordUuid,
	})
	return response.data
}

// Sets

const setHealthRecord = async (
	healthRecord: HealthRecord,
	userUuid: string,
	farmUuid?: string
): Promise<{ uuid: string; isNew: boolean }> => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('health', {
		operation: 'upsertHealthRecord',
		healthRecord: { ...healthRecord, uuid: undefined }, // Remove uuid for new health records
		userUuid,
		farmUuid: farmUuid || '',
	})
	return response.data
}

const setHealthRecordGiveBirth = async (animalUuid: string, userUuid: string, farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('health', {
		operation: 'setHealthRecordGiveBirth',
		animalUuid,
		userUuid,
		farmUuid,
	})
	return response
}

const setHealthRecordDrying = async (animalUuid: string, userUuid: string, farmUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('health', {
		operation: 'setHealthRecordDrying',
		animalUuid,
		userUuid,
		farmUuid,
	})
	return response
}

// Update

const updateHealthRecord = async (
	healthRecord: HealthRecord,
	userUuid: string,
	farmUuid?: string
) => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('health', {
		operation: 'upsertHealthRecord',
		healthRecord,
		userUuid,
		farmUuid: farmUuid || '',
	})
	return response.data
}

// Delete

const updateHealthRecordsStatus = async (healthRecordUuid: string, userUuid: string) => {
	const response = await callableFireFunction<{ success: boolean }>('health', {
		operation: 'updateHealthRecordStatus',
		healthRecordUuid,
		userUuid,
	})
	return response
}

export const HealthRecordsService = {
	getHealthRecords,
	getHealthRecord,
	setHealthRecord,
	setHealthRecordGiveBirth,
	setHealthRecordDrying,
	updateHealthRecord,
	updateHealthRecordsStatus,
}
