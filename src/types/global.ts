export type Role = 'employee' | 'owner' | 'admin'

export type Relationship = 'Father' | 'Mother' | 'Daughter' | 'Son'

export type Gender = 'Male' | 'Female' | ''

export type HealthRecordType =
	| ''
	| 'Checkup'
	| 'Vaccination'
	| 'Medication'
	| 'Surgery'
	| 'Pregnancy'
	| 'Deworming'
	| 'Birth'
	| 'Drying'
	| 'HoofCare'
	| 'Castration'
	| 'Dehorning'

export type HealthStatus = 'healthy' | 'sick' | 'treatment' | 'unknown' | 'critical' | 'withdrawal'
