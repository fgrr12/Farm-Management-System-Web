declare type healthRecordType =
	| 'Checkup'
	| 'Vaccination'
	| 'Medication'
	| 'Surgery'
	| 'Pregnancy'
	| 'Deworming'
	| 'Birth'

export interface GetAnimalsProps {
	speciesUuid: string
	search: string
	farmUuid: string | null
}

export interface SetAnimalProps extends Animal {}

export interface GetAnimalResponse extends Animal {}
