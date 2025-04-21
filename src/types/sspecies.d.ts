interface Species {
	uuid: string
	name: string
	breeds: Breed[]
	status: boolean
}

interface Breed {
	uuid: string
	name: string
	gestationPeriod: number
}
