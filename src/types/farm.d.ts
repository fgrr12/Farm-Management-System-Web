interface BillingCard {
	name: string
	phone: string
	id: string
	email: string
	address: string
}

interface Farm {
	uuid: string
	name: string
	address: string
	liquidUnit: string
	weightUnit: string
	temperatureUnit: string
	billingCard: BillingCard | null
	species?: Species[]
	status: boolean
}
