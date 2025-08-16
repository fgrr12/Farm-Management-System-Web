export type CustomSelectVariant = 'default' | 'filled' | 'outlined'
export type CustomSelectSize = 'sm' | 'md' | 'lg'

export interface CustomSelectOption {
	value: string | number
	label: string
	image?: string
	description?: string
	disabled?: boolean
	group?: string
}

export interface CustomSelectProps {
	// Core props
	value?: string | number
	onChange?: (value: string | number | null) => void
	onBlur?: () => void
	onFocus?: () => void

	// Options
	options: CustomSelectOption[]

	// Labels and text
	label?: string
	placeholder?: string
	defaultLabel?: string
	helperText?: string
	error?: string

	// Styling
	variant?: CustomSelectVariant
	size?: CustomSelectSize
	className?: string

	// Features
	searchable?: boolean
	clearable?: boolean
	disabled?: boolean
	loading?: boolean
	required?: boolean

	// Icons
	leftIcon?: string
	leftImage?: string // URL or base64 image for left side

	// Validation
	success?: boolean
	successMessage?: string

	// Form props
	name?: string
	id?: string

	// Advanced
	renderOption?: (option: CustomSelectOption) => React.ReactNode
	filterFunction?: (option: CustomSelectOption, searchTerm: string) => boolean
	noOptionsMessage?: string
	loadingMessage?: string
}

export interface CustomSelectRef {
	focus: () => void
	blur: () => void
	clear: () => void
}
