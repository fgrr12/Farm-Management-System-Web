import type { FC } from 'react'
import { useId, useState } from 'react'

import type { TextFieldProps } from './TextField.types'

export const TextField: FC<TextFieldProps> = ({ label, error, required, ...rest }) => {
	const fieldId = useId()

	return (
		<fieldset className="fieldset w-full">
			<legend className="fieldset-legend">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</legend>
			<div className="relative w-full group">
				<input
					id={fieldId}
					className={`input w-full h-12 validator ${error ? 'border-red-500 pr-10' : ''}`}
					required={required}
					aria-invalid={!!error}
					aria-describedby={error ? `${fieldId}-error` : undefined}
					{...rest}
				/>

				{error && (
					<div className="absolute inset-y-0 right-0 flex items-center pr-3">
						<i className="i-lucide-alert-circle text-red-500 w-4 h-4 cursor-help" title={error} />
					</div>
				)}

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
		</fieldset>
	)
}

export const PasswordField: FC<TextFieldProps> = ({ label, error, required = true, ...rest }) => {
	const [showPassword, setShowPassword] = useState<boolean>(false)
	const fieldId = useId()

	const handleClick = () => {
		setShowPassword((prev) => !prev)
	}

	return (
		<fieldset className="fieldset w-full">
			<legend className="fieldset-legend">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</legend>
			<div className="relative w-full group">
				<label className={`input w-full h-12 ${error ? 'border-red-500' : ''}`}>
					<i className="i-material-symbols-light-key w-6! h-6!" />
					<input
						id={fieldId}
						className="w-full h-12"
						type={showPassword ? 'text' : 'password'}
						placeholder="Password"
						required={required}
						aria-invalid={!!error}
						aria-describedby={error ? `${fieldId}-error` : undefined}
						{...rest}
					/>
					<button
						type="button"
						className="btn btn-square btn-ghost btn-sm bg-transparent border-none shadow-none"
						onClick={handleClick}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						<i
							className={`
						${showPassword ? 'i-material-symbols-visibility-lock' : 'i-material-symbols-visibility'} w-6! h-6!
					`}
						/>
					</button>
				</label>

				{error && (
					<div className="absolute inset-y-0 right-14 flex items-center pr-3">
						<i className="i-lucide-alert-circle text-red-500 w-4 h-4 cursor-help" title={error} />
					</div>
				)}

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
		</fieldset>
	)
}
