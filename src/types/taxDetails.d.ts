interface Activity {
	name: string
	code: string
}

interface TaxDetails {
	uuid: string
	id: string
	name: string
	phone: string
	email: string
	address: string
	activities: Activity[]
	status: boolean
}
