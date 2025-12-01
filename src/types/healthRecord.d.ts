interface HealthRecord {
	uuid: string
	animalUuid: string
	reason: string
	notes: string
	type: HealthRecordType
	reviewedBy: string
	createdBy: string
	date: string
	status: boolean
	weight?: number
	temperature?: number
	medication?: string
	dosage?: string
	frequency?: string
	duration?: string
	createdAt?: string
	updatedAt?: string
	// New fields for commercial compliance
	withdrawalDays?: number
	withdrawalEndDate?: string
	administrationRoute?:
		| 'IM'
		| 'SC'
		| 'Oral'
		| 'Topical'
		| 'Intramammary'
		| 'IV'
		| 'Intrauterine'
		| 'Other'
	injectionSite?: 'Neck' | 'Rump' | 'Leg' | 'Ear' | 'Flank' | 'Tail' | 'Other'
	batchNumber?: string
	manufacturer?: string
	technician?: string
}
