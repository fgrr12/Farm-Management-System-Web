declare type healthRecordType =
	| 'Checkup'
	| 'Vaccination'
	| 'Medication'
	| 'Surgery'
	| 'Pregnancy'
	| 'Deworming'
	| 'Birth'

export interface GetAnimalsProps {
	selectedSpecies: {
		uuid: string
		name: string
	}
	search: string
	farmUuid: string | null
}

export interface SetAnimalProps extends Animal {}

export interface GetAnimalResponse extends Animal {}
