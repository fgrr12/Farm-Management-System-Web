type Role = 'employee' | 'owner' | 'admin'

type Relationship = 'Father' | 'Mother' | 'Daughter' | 'Son'

type Gender = 'Male' | 'Female' | ''

type HealthRecordType =
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

type HealthStatus = 'healthy' | 'sick' | 'treatment' | 'unknown' | 'critical' | 'withdrawal'
