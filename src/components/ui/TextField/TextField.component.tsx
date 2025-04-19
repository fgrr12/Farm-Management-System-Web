import { useState } from 'react'

import type { TextFieldProps } from './TextField.types'

export const TextField: FC<TextFieldProps> = ({ type, label, ...rest }) => {
	return (
		<fieldset className="fieldset w-full">
			<legend className="fieldset-legend">{label}</legend>
			<input type={type} className="input w-full h-12" {...rest} />
		</fieldset>
	)
}

export const PasswordField: FC<TextFieldProps> = ({ className, label, ...rest }) => {
	const [showPassword, setShowPassword] = useState<boolean>(false)

	const handleClick = () => {
		setShowPassword((prev) => !prev)
	}

	return (
		<fieldset className="fieldset">
			<legend className="fieldset-legend">{label}</legend>
			<label className="input w-full h-12">
				<i className="i-material-symbols-light-key w-6! h-6!" />
				<input
					type={showPassword ? 'text' : 'password'}
					placeholder="Password"
					required
					{...rest}
				/>
				<button
					type="button"
					className="btn btn-square btn-ghost btn-sm bg-transparent border-none shadow-none"
					onClick={handleClick}
				>
					<i
						className={`
					${showPassword ? 'i-material-symbols-visibility-lock' : 'i-material-symbols-visibility'} w-6! h-6!
				`}
					/>
				</button>
			</label>
		</fieldset>
	)
}
