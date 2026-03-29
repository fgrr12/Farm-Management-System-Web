export interface Farm {
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

export type LiquidUnit = 'L' | 'Gal'
export type WeightUnit = 'Kg' | 'P'
export type TemperatureUnit = '°C' | '°F'
export type FarmLanguage = 'eng' | 'spa'
