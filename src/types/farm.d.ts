interface Farm {
	uuid: string
	name: string
	address: string
	liquidUnit: string
	weightUnit: string
	temperatureUnit: string
	species?: Species[]
	status: boolean
}
