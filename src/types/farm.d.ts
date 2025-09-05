interface Farm {
	uuid: string
	taxDetailsUuid: string
	name: string
	address: string
	liquidUnit: LiquidUnit
	weightUnit: WeightUnit
	temperatureUnit: TemperatureUnit
	language: FarmLanguage
	status: boolean
}

type LiquidUnit = 'L' | 'Gal'
type WeightUnit = 'Kg' | 'P'
type TemperatureUnit = '°C' | '°F'
type FarmLanguage = 'eng' | 'spa'
