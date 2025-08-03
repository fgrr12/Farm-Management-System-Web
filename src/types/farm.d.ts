interface Farm {
	uuid: string
	billingCardUuid: string
	name: string
	address: string
	liquidUnit: LiquidUnit
	weightUnit: WeightUnit
	temperatureUnit: TemperatureUnit
	status: boolean
}

type LiquidUnit = 'L' | 'Gal'
type WeightUnit = 'Kg' | 'P'
type TemperatureUnit = '°C' | '°F'
