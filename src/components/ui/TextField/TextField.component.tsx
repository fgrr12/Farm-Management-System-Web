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
			<input
				id={fieldId}
				className={`input w-full h-12 validator ${error ? 'input-error' : ''}`}
				required={required}
				aria-invalid={!!error}
				{...rest}
			/>
			{error && <div className="mt-1 text-sm text-red-600">{error}</div>}
		</fieldset>
	)
}

export const PasswordField: FC<TextFieldProps> = ({ label, error, required, ...rest }) => {
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
			<label className="input w-full h-12">
				<i className="i-material-symbols-light-key w-6! h-6!" />
				<input
					id={fieldId}
					className="w-full h-12"
					type={showPassword ? 'text' : 'password'}
					placeholder="Password"
					required={required}
					aria-invalid={!!error}
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
				<div className="mt-1 text-sm text-red-600">
					{error}
				</div>
			)}
		</fieldset>
	)
}
