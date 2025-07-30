import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { FC } from 'react'
import { memo, useCallback, useId, useMemo, useRef, useState } from 'react'

import type { PasswordFieldProps, TextFieldProps } from './TextField.types'

export const TextField: FC<TextFieldProps> = memo(
	({
		label,
		error,
		helperText,
		variant = 'default',
		size = 'md',
		leftIcon,
		rightIcon,
		loading = false,
		success = false,
		successMessage,
		required,
		className,
		...rest
	}) => {
		const fieldId = useId()
		const inputRef = useRef<HTMLInputElement>(null)
		const [isFocused, setIsFocused] = useState(false)

		const fieldClasses = useMemo(() => {
			const baseClasses = 'w-full transition-all duration-200 focus:outline-none'

			const variantClasses = {
				default:
					'input bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
				filled:
					'bg-gray-100 border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:bg-white rounded-t-lg rounded-b-none px-4',
				outlined:
					'bg-transparent border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
			}

			const sizeClasses = {
				sm: 'h-10 text-sm px-3',
				md: 'h-12 text-base px-4',
				lg: 'h-14 text-lg px-5',
			}

			const stateClasses = error
				? 'border-red-500 focus:border-red-500 focus:ring-red-200'
				: success
					? 'border-green-500 focus:border-green-500 focus:ring-green-200'
					: ''

			const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : ''

			return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses} ${iconPadding} ${className || ''}`
		}, [variant, size, error, success, leftIcon, rightIcon, className])

		const labelClasses = useMemo(() => {
			const baseClasses = 'block text-sm font-medium mb-2 transition-colors duration-200'
			const stateClasses = error
				? 'text-red-700'
				: success
					? 'text-green-700'
					: isFocused
						? 'text-blue-700'
						: 'text-gray-700'

			return `${baseClasses} ${stateClasses}`
		}, [error, success, isFocused])

		useGSAP(() => {
			if (inputRef.current) {
				gsap.fromTo(
					inputRef.current,
					{ y: 10, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
				)
			}
		}, [])

		const handleFocus = useCallback(
			(e: React.FocusEvent<HTMLInputElement>) => {
				setIsFocused(true)
				if (inputRef.current) {
					gsap.to(inputRef.current, { scale: 1.01, duration: 0.2, ease: 'power1.out' })
				}
				rest.onFocus?.(e)
			},
			[rest.onFocus]
		)

		const handleBlur = useCallback(
			(e: React.FocusEvent<HTMLInputElement>) => {
				setIsFocused(false)
				if (inputRef.current) {
					gsap.to(inputRef.current, { scale: 1, duration: 0.2, ease: 'power1.out' })
				}
				rest.onBlur?.(e)
			},
			[rest.onBlur]
		)

		return (
			<div className="w-full">
				{label && (
					<label htmlFor={fieldId} className={labelClasses}>
						{label}
						{required && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}

				<div className="relative group">
					{/* Left Icon */}
					{leftIcon && (
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
							<i
								className={`${leftIcon} w-5! h-5! ${error ? 'bg-red-500!' : success ? 'bg-green-500!' : 'bg-gray-400!'}`}
							/>
						</div>
					)}

					{/* Input Field */}
					<input
						ref={inputRef}
						id={fieldId}
						className={fieldClasses}
						required={required}
						aria-invalid={!!error}
						aria-describedby={
							error
								? `${fieldId}-error`
								: helperText
									? `${fieldId}-helper`
									: success
										? `${fieldId}-success`
										: undefined
						}
						onFocus={handleFocus}
						onBlur={handleBlur}
						{...rest}
					/>

					{/* Right Icon or Loading */}
					{(rightIcon || loading || error || success) && (
						<div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
							{loading ? (
								<div className="animate-spin">
									<i className="i-material-symbols-progress-activity w-5! h-5! bg-blue-500!" />
								</div>
							) : error ? (
								<i className="i-material-symbols-error w-5! h-5! bg-red-500!" title={error} />
							) : success ? (
								<i className="i-material-symbols-check-circle w-5! h-5! bg-green-500!" />
							) : rightIcon ? (
								<i className={`${rightIcon} w-5! h-5! bg-gray-400!`} />
							) : null}
						</div>
					)}

					{/* Error Tooltip */}
					{error && (
						<div
							id={`${fieldId}-error`}
							className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-30 max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 ease-in-out"
							role="tooltip"
							aria-live="polite"
						>
							<div className="text-sm text-red-700 font-medium">{error}</div>
							<div className="absolute -top-2 left-4 w-4 h-4 bg-red-50 border-l border-t border-red-200 transform rotate-45" />
						</div>
					)}
				</div>

				{/* Helper Text */}
				{helperText && !error && (
					<div id={`${fieldId}-helper`} className="text-sm text-gray-600 mt-1">
						{helperText}
					</div>
				)}

				{/* Success Message */}
				{success && successMessage && (
					<div
						id={`${fieldId}-success`}
						className="text-sm text-green-600 mt-1 flex items-center gap-1"
					>
						<i className="i-material-symbols-check-circle w-4! h-4! bg-green-500!" />
						<span>{successMessage}</span>
					</div>
				)}
			</div>
		)
	}
)

export const PasswordField: FC<PasswordFieldProps> = memo(
	({
		label = 'Password',
		showStrengthIndicator = false,
		strengthText = {
			weak: 'Weak',
			medium: 'Medium',
			strong: 'Strong',
		},
		required = true,
		...rest
	}) => {
		const [showPassword, setShowPassword] = useState(false)
		const [password, setPassword] = useState('')
		const fieldId = useId()

		const passwordStrength = useMemo(() => {
			if (!password) return null

			let score = 0
			if (password.length >= 8) score++
			if (/[A-Z]/.test(password)) score++
			if (/[a-z]/.test(password)) score++
			if (/[0-9]/.test(password)) score++
			if (/[^A-Za-z0-9]/.test(password)) score++

			if (score <= 2) return { level: 'weak', color: 'red', width: '33%' }
			if (score <= 4) return { level: 'medium', color: 'yellow', width: '66%' }
			return { level: 'strong', color: 'green', width: '100%' }
		}, [password])

		const handlePasswordChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				setPassword(e.target.value)
				rest.onChange?.(e)
			},
			[rest.onChange]
		)

		const togglePasswordVisibility = useCallback(() => {
			setShowPassword((prev) => !prev)
		}, [])

		return (
			<div className="w-full relative">
				<TextField
					{...rest}
					id={fieldId}
					label={label}
					type={showPassword ? 'text' : 'password'}
					required={required}
					leftIcon="i-material-symbols-lock"
					onChange={handlePasswordChange}
					rightIcon={undefined} // We'll handle the right icon manually
				/>

				{/* Custom Right Icon for Password Toggle */}
				<div
					className="absolute inset-y-0 right-0 flex items-center z-10"
					style={{ top: label ? '32px' : '0' }}
				>
					<button
						type="button"
						className="flex items-center justify-center w-12 h-12 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
						onClick={togglePasswordVisibility}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						<i
							className={`${showPassword ? 'i-material-symbols-visibility-off' : 'i-material-symbols-visibility'} w-5! h-5! bg-current!`}
						/>
					</button>
				</div>

				{/* Password Strength Indicator */}
				{showStrengthIndicator && password && passwordStrength && (
					<div className="mt-2">
						<div className="flex items-center justify-between mb-1">
							<span className="text-xs text-gray-600">Password strength</span>
							<span
								className={`text-xs font-medium ${
									passwordStrength.level === 'weak'
										? 'text-red-600'
										: passwordStrength.level === 'medium'
											? 'text-yellow-600'
											: 'text-green-600'
								}`}
							>
								{strengthText[passwordStrength.level as keyof typeof strengthText]}
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className={`h-2 rounded-full transition-all duration-300 ${
									passwordStrength.level === 'weak'
										? 'bg-red-500'
										: passwordStrength.level === 'medium'
											? 'bg-yellow-500'
											: 'bg-green-500'
								}`}
								style={{ width: passwordStrength.width }}
							/>
						</div>
					</div>
				)}
			</div>
		)
	}
)
