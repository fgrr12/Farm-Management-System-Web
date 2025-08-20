import { callableFireFunction } from '@/utils/callableFireFunction'

const setTaxDetails = async (
	taxDetails: TaxDetails,
	userUuid: string,
	farmUuid: string
): Promise<{ uuid: string; isNew: boolean }> => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('taxDetails', {
		operation: 'upsertTaxDetails',
		taxDetails: { ...taxDetails, uuid: undefined }, // Remove uuid for new tax details
		userUuid,
		farmUuid,
	})
	return response.data
}

const updateTaxDetails = async (taxDetails: TaxDetails, userUuid: string, farmUuid: string) => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('taxDetails', {
		operation: 'upsertTaxDetails',
		taxDetails,
		userUuid,
		farmUuid,
	})
	return response.data
}

export const TaxDetailsService = {
	setTaxDetails,
	updateTaxDetails,
}
