export interface Activity {
	name: string
	code: string
}

export interface TaxDetails {
	uuid: string
	id: string
	name: string
	phone: string
	email: string
	address: string
	activities: Activity[]
	status: boolean
}
