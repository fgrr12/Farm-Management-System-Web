import { callableFireFunction } from '@/utils/callableFireFunction'

const getBillingCardByUuid = async (billingCardUuid: string): Promise<BillingCard> => {
	const response = await callableFireFunction<{ success: boolean; data: BillingCard }>(
		'billingCards',
		{
			operation: 'getBillingCardByUuid',
			billingCardUuid,
		}
	)
	return response.data
}

const setBillingCard = async (
	billingCard: BillingCard,
	userUuid: string,
	farmUuid: string
): Promise<{ uuid: string; isNew: boolean }> => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('billingCards', {
		operation: 'upsertBillingCard',
		billingCard: { ...billingCard, uuid: undefined }, // Remove uuid for new billing cards
		userUuid,
		farmUuid,
	})
	return response.data
}

const updateBillingCard = async (billingCard: BillingCard, userUuid: string, farmUuid: string) => {
	const response = await callableFireFunction<{
		success: boolean
		data: { uuid: string; isNew: boolean }
	}>('billingCards', {
		operation: 'upsertBillingCard',
		billingCard,
		userUuid,
		farmUuid,
	})
	return response.data
}

export const BillingCardsService = {
	getBillingCardByUuid,
	setBillingCard,
	updateBillingCard,
}
