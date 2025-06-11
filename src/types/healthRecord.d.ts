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
}
