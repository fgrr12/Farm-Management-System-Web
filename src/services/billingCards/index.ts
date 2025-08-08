import { callableFireFunction } from '@/utils/callableFireFunction'

const FUNCTIONS = {
	getBillingCardByUuid: 'getBillingCardByUuid',
	setBillingCard: 'setBillingCard',
	updateBillingCard: 'updateBillingCard',
} as const

const getBillingCardByUuid = async (uuid: string) => {
	return callableFireFunction<BillingCard>(FUNCTIONS.getBillingCardByUuid, { uuid })
}

const setBillingCard = async (billingCard: BillingCard, createdBy: string) => {
	return callableFireFunction(FUNCTIONS.setBillingCard, { billingCard, createdBy })
}

const updateBillingCard = async (billingCard: BillingCard, updatedBy: string) => {
	return callableFireFunction(FUNCTIONS.updateBillingCard, { billingCard, updatedBy })
}

export const BillingCardsService = {
	getBillingCardByUuid,
	setBillingCard,
	updateBillingCard,
}
