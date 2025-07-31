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

			const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : ''

			return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses} ${iconPadding} ${className || ''}`
		}, [variant, size, error, success, leftIcon, rightIcon, className])

		const labelClasses = useMemo(() => {
			const baseClasses = 'block text-sm font-medium mb-2 transition-colors duration-200'
			const stateClasses = error
				? 'text-red-700 dark:text-red-400'
				: success
					? 'text-green-700 dark:text-green-400'
					: isFocused
						? 'text-blue-700 dark:text-blue-400'
						: 'text-gray-700 dark:text-gray-300'

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
						{required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
					</label>
				)}

				<div className="relative group">
					{/* Left Icon */}
					{leftIcon && (
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
							<i
								className={`${leftIcon} w-5! h-5! ${
									error
										? 'bg-red-500! dark:bg-red-400!'
										: success
											? 'bg-green-500! dark:bg-green-400!'
											: 'bg-gray-400! dark:bg-gray-500!'
								}`}
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
									<i className="i-material-symbols-progress-activity w-5! h-5! bg-blue-500! dark:bg-blue-400!" />
								</div>
							) : error ? (
								<i
									className="i-material-symbols-error w-5! h-5! bg-red-500! dark:bg-red-400!"
									title={error}
								/>
							) : success ? (
								<i className="i-material-symbols-check-circle w-5! h-5! bg-green-500! dark:bg-green-400!" />
							) : rightIcon ? (
								<i className={`${rightIcon} w-5! h-5! bg-gray-400! dark:bg-gray-500!`} />
							) : null}
						</div>
					)}

					{/* Error Tooltip */}
					{error && (
						<div
							id={`${fieldId}-error`}
							className="absolute top-full left-0 mt-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg shadow-lg dark:shadow-red-900/20 z-30 max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 ease-in-out backdrop-blur-sm"
							role="tooltip"
							aria-live="polite"
						>
							<div className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</div>
							<div className="absolute -top-2 left-4 w-4 h-4 bg-red-50 dark:bg-red-900/30 border-l border-t border-red-200 dark:border-red-700 transform rotate-45" />
						</div>
					)}
				</div>

				{/* Helper Text */}
				{helperText && !error && (
					<div id={`${fieldId}-helper`} className="text-sm text-gray-600 dark:text-gray-400 mt-1">
						{helperText}
					</div>
				)}

				{/* Success Message */}
				{success && successMessage && (
					<div
						id={`${fieldId}-success`}
						className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1"
					>
						<i className="i-material-symbols-check-circle w-4! h-4! bg-green-500! dark:bg-green-400!" />
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
						className="flex items-center justify-center w-12 h-12 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 dark:focus:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:bg-gray-100 dark:focus:bg-gray-700/50"
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
							<span className="text-xs text-gray-600 dark:text-gray-400">Password strength</span>
							<span
								className={`text-xs font-medium ${
									passwordStrength.level === 'weak'
										? 'text-red-600 dark:text-red-400'
										: passwordStrength.level === 'medium'
											? 'text-yellow-600 dark:text-yellow-400'
											: 'text-green-600 dark:text-green-400'
								}`}
							>
								{strengthText[passwordStrength.level as keyof typeof strengthText]}
							</span>
						</div>
						<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
							<div
								className={`h-2 rounded-full transition-all duration-300 ${
									passwordStrength.level === 'weak'
										? 'bg-red-500 dark:bg-red-400'
										: passwordStrength.level === 'medium'
											? 'bg-yellow-500 dark:bg-yellow-400'
											: 'bg-green-500 dark:bg-green-400'
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
