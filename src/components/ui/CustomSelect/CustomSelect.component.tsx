import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import {
	type ChangeEvent,
	forwardRef,
	type KeyboardEvent,
	useCallback,
	useEffect,
	useId,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import type { CustomSelectOption, CustomSelectProps, CustomSelectRef } from './CustomSelect.types'

export const CustomSelect = forwardRef<CustomSelectRef, CustomSelectProps>(
	(
		{
			value,
			onChange,
			onBlur,
			onFocus,
			options = [],
			label,
			placeholder,
			defaultLabel,
			helperText,
			error,
			variant = 'default',
			size = 'md',
			className,
			searchable = true,
			clearable = true,
			disabled = false,
			loading = false,
			required = false,
			leftIcon,
			leftImage,
			success = false,
			successMessage,
			name,
			id,
			renderOption,
			filterFunction,
			noOptionsMessage,
			loadingMessage,
		},
		ref
	) => {
		const { t } = useTranslation(['common'])
		const fieldId = useId()
		const componentId = id || fieldId

		// Refs
		const containerRef = useRef<HTMLDivElement>(null)
		const inputRef = useRef<HTMLInputElement>(null)
		const dropdownRef = useRef<HTMLDivElement>(null)

		// State
		const [isOpen, setIsOpen] = useState(false)
		const [isFocused, setIsFocused] = useState(false)
		const [searchTerm, setSearchTerm] = useState('')
		const [highlightedIndex, setHighlightedIndex] = useState(-1)

		// Find selected option
		const selectedOption = useMemo(() => {
			return options.find((option) => option.value === value) || null
		}, [options, value])

		// Filter options based on search term
		const filteredOptions = useMemo(() => {
			if (!searchTerm.trim()) return options

			if (filterFunction) {
				return options.filter((option) => filterFunction(option, searchTerm))
			}

			// Default filter: search in label and description
			return options.filter(
				(option) =>
					option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(option.description &&
						option.description.toLowerCase().includes(searchTerm.toLowerCase()))
			)
		}, [options, searchTerm, filterFunction])

		// Display value (what shows in input)
		const displayValue = useMemo(() => {
			if (isOpen && searchable) {
				return searchTerm
			}
			return selectedOption?.label || ''
		}, [isOpen, searchable, searchTerm, selectedOption])

		// Classes
		const containerClasses = useMemo(() => {
			const baseClasses = 'relative w-full touch-manipulation'
			return `${baseClasses} ${className || ''}`
		}, [className])

		const inputClasses = useMemo(() => {
			const baseClasses = 'w-full transition-all duration-200 focus:outline-none'

			const variantClasses = {
				default:
					'input bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400',
				filled:
					'bg-gray-100 dark:bg-gray-700 border-0 border-b-2 border-gray-300 dark:border-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-600 rounded-t-lg rounded-b-none px-4 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400',
				outlined:
					'bg-transparent border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400',
			}

			const sizeClasses = {
				sm: 'h-10 text-sm px-3',
				md: 'h-12 text-base px-4',
				lg: 'h-14 text-lg px-5',
			}

			const stateClasses = error
				? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-500/20'
				: success
					? 'border-green-500 dark:border-green-400 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-200 dark:focus:ring-green-500/20'
					: ''

			const iconPadding = leftIcon || leftImage ? 'pl-12' : ''
			const rightPadding = 'pr-12' // Always same padding since we have either arrow or clear button

			return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses} ${iconPadding} ${rightPadding}`
		}, [variant, size, error, success, leftIcon, leftImage])

		const labelClasses = useMemo(() => {
			const baseClasses = 'block text-sm font-medium mb-2 transition-colors duration-200'
			const stateClasses = error
				? 'text-red-600 dark:text-red-400'
				: success
					? 'text-green-600 dark:text-green-400'
					: isFocused
						? 'text-blue-600 dark:text-blue-400'
						: 'text-gray-700 dark:text-gray-300'

			return `${baseClasses} ${stateClasses}`
		}, [error, success, isFocused])

		// Imperative handle
		useImperativeHandle(ref, () => ({
			focus: () => inputRef.current?.focus(),
			blur: () => inputRef.current?.blur(),
			clear: () => handleClear(),
		}))

		// Handle input focus
		const handleInputFocus = useCallback(() => {
			setIsFocused(true)
			setIsOpen(true)
			if (searchable && selectedOption) {
				setSearchTerm('')
			}
			onFocus?.()
		}, [searchable, selectedOption, onFocus])

		// Handle input blur
		const handleInputBlur = useCallback(() => {
			// Small delay to allow option selection
			setTimeout(() => {
				setIsFocused(false)
				setIsOpen(false)

				// Reset search term and validate selection
				if (searchable) {
					if (
						!selectedOption ||
						(searchTerm && !selectedOption.label.toLowerCase().includes(searchTerm.toLowerCase()))
					) {
						// If no valid selection, clear the value
						if (
							searchTerm &&
							!filteredOptions.some((opt) => opt.label.toLowerCase() === searchTerm.toLowerCase())
						) {
							setSearchTerm('')
							onChange?.(null)
						} else {
							// Reset to selected option
							setSearchTerm('')
						}
					}
				}

				setHighlightedIndex(-1)
				onBlur?.()
			}, 200)
		}, [searchable, selectedOption, searchTerm, filteredOptions, onChange, onBlur])

		// Handle input change (search)
		const handleInputChange = useCallback(
			(e: ChangeEvent<HTMLInputElement>) => {
				const newValue = e.target.value
				setSearchTerm(newValue)
				setHighlightedIndex(-1)

				if (!isOpen) {
					setIsOpen(true)
				}
			},
			[isOpen]
		)

		// Handle option selection
		const handleOptionSelect = useCallback(
			(option: CustomSelectOption) => {
				if (option.disabled) return

				onChange?.(option.value)
				setSearchTerm('')
				setIsOpen(false)
				setHighlightedIndex(-1)
				inputRef.current?.blur()
			},
			[onChange]
		)

		// Handle clear
		const handleClear = useCallback(() => {
			onChange?.(null)
			setSearchTerm('')
			setIsOpen(false)
			setHighlightedIndex(-1)
			inputRef.current?.focus()
		}, [onChange])

		// Handle keyboard navigation
		const handleKeyDown = useCallback(
			(e: KeyboardEvent<HTMLInputElement>) => {
				switch (e.key) {
					case 'ArrowDown':
						e.preventDefault()
						setIsOpen(true)
						setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0))
						break
					case 'ArrowUp':
						e.preventDefault()
						setIsOpen(true)
						setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1))
						break
					case 'Enter':
						e.preventDefault()
						if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
							handleOptionSelect(filteredOptions[highlightedIndex])
						} else if (!isOpen) {
							setIsOpen(true)
						}
						break
					case 'Escape':
						e.preventDefault()
						setIsOpen(false)
						setHighlightedIndex(-1)
						inputRef.current?.blur()
						break
					case 'Tab':
						setIsOpen(false)
						setHighlightedIndex(-1)
						break
				}
			},
			[isOpen, highlightedIndex, filteredOptions, handleOptionSelect]
		)

		// Handle click outside
		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
					setIsOpen(false)
					setHighlightedIndex(-1)
				}
			}

			if (isOpen) {
				document.addEventListener('mousedown', handleClickOutside)
			}

			return () => {
				document.removeEventListener('mousedown', handleClickOutside)
			}
		}, [isOpen])

		// GSAP animations
		useGSAP(() => {
			if (dropdownRef.current) {
				if (isOpen) {
					gsap.fromTo(
						dropdownRef.current,
						{ opacity: 0, y: -10, scale: 0.95 },
						{ opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' }
					)
				}
			}
		}, [isOpen])

		// Default option renderer
		const defaultRenderOption = useCallback(
			(option: CustomSelectOption) => (
				<div className="flex items-center gap-3 w-full">
					{option.image && (
						<img
							src={option.image}
							alt={option.label}
							className="w-8 h-8 rounded-full object-cover shrink-0"
						/>
					)}
					<div className="flex-1 min-w-0">
						<div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
							{option.label}
						</div>
						{option.description && (
							<div className="text-xs text-gray-500 dark:text-gray-400 truncate">
								{option.description}
							</div>
						)}
					</div>
				</div>
			),
			[]
		)

		const optionRenderer = renderOption || defaultRenderOption

		return (
			<div className={containerClasses} ref={containerRef}>
				{/* Label */}
				{label && (
					<div className={labelClasses}>
						{label}
						{required && <span className="text-red-500 ml-1">*</span>}
					</div>
				)}{' '}
				{/* Input Container */}
				<div className="relative">
					{/* Left Icon or Image */}
					{leftIcon && (
						<div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
							<i className={`${leftIcon} w-5! h-5! text-gray-400`} />
						</div>
					)}
					{leftImage && (
						<div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
							<img src={leftImage} alt="" className="w-5 h-5 rounded-full object-cover" />
						</div>
					)}
					{/* Input */}
					<input
						ref={inputRef}
						id={componentId}
						name={name}
						type="text"
						value={displayValue}
						onChange={handleInputChange}
						onFocus={handleInputFocus}
						onBlur={handleInputBlur}
						onKeyDown={handleKeyDown}
						placeholder={
							isOpen && searchable
								? t('common:customSelect.searchPlaceholder')
								: placeholder || defaultLabel || t('common:customSelect.selectOption')
						}
						disabled={disabled || loading}
						readOnly={!searchable}
						className={inputClasses}
						autoComplete="off"
						role="combobox"
						aria-expanded={isOpen}
						aria-haspopup="listbox"
						aria-autocomplete={searchable ? 'list' : 'none'}
					/>
					{/* Clear Button and Dropdown Arrow */}
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						{loading ? (
							<div className="w-5 h-5 pointer-events-none">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
							</div>
						) : clearable && selectedOption && !disabled ? (
							<button
								type="button"
								onClick={handleClear}
								className="w-5 h-5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors hover:scale-110 active:scale-95"
								tabIndex={-1}
								title={t('common:customSelect.clear')}
							>
								<i className="i-material-symbols-close w-full! h-full!" />
							</button>
						) : (
							<div className="w-5 h-5 pointer-events-none">
								<i
									className={`i-material-symbols-expand-more w-5! h-5! text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
								/>
							</div>
						)}
					</div>{' '}
					{/* Dropdown */}
					{isOpen && !disabled && (
						<div
							ref={dropdownRef}
							className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
							role="listbox"
						>
							{loading ? (
								<div className="p-3 text-center text-gray-500 dark:text-gray-400">
									{loadingMessage || t('common:loading')}
								</div>
							) : filteredOptions.length > 0 ? (
								filteredOptions.map((option, index) => (
									<button
										key={option.value}
										type="button"
										onClick={() => handleOptionSelect(option)}
										disabled={option.disabled}
										className={`w-full p-3 text-left transition-colors ${
											index === highlightedIndex
												? 'bg-blue-50 dark:bg-blue-900/20'
												: 'hover:bg-gray-50 dark:hover:bg-gray-700'
										} ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
											selectedOption?.value === option.value
												? 'bg-blue-100 dark:bg-blue-900/30'
												: ''
										} first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20`}
										role="option"
										aria-selected={selectedOption?.value === option.value}
									>
										{optionRenderer(option)}
									</button>
								))
							) : (
								<div className="p-3 text-center text-gray-500 dark:text-gray-400">
									{noOptionsMessage || t('common:customSelect.noOptions')}
								</div>
							)}
						</div>
					)}
				</div>
				{/* Helper Text */}
				{(helperText || error || (success && successMessage)) && (
					<div className="mt-2 text-sm">
						{error && (
							<div className="flex items-center gap-2 text-red-600 dark:text-red-400">
								<i className="i-material-symbols-error w-4! h-4!" />
								{error}
							</div>
						)}
						{success && successMessage && !error && (
							<div className="flex items-center gap-2 text-green-600 dark:text-green-400">
								<i className="i-material-symbols-check-circle w-4! h-4!" />
								{successMessage}
							</div>
						)}
						{helperText && !error && !(success && successMessage) && (
							<div className="text-gray-500 dark:text-gray-400">{helperText}</div>
						)}
					</div>
				)}
			</div>
		)
	}
)

CustomSelect.displayName = 'CustomSelect'
