import { useState } from 'react'

import type { TextFieldProps } from './TextField.types'

import * as S from './TextField.styles'

export const TextField: FC<TextFieldProps> = ({ className, type, label, ...rest }) => {
	return (
		<S.TextFieldContainer className={className}>
			<S.TextField id="textfield-input" type={type} {...rest} />
			{label && <S.Label htmlFor="textfield-input">{label}</S.Label>}
		</S.TextFieldContainer>
	)
}

export const PasswordField: FC<TextFieldProps> = ({ className, label, ...rest }) => {
	const [showPassword, setShowPassword] = useState<boolean>(false)

	const handleClick = () => {
		setShowPassword((prev) => !prev)
	}

	return (
		<S.TextFieldContainer className={className}>
			<S.PasswordIcon
				className={
					showPassword ? 'i-material-symbols-visibility' : 'i-material-symbols-visibility-lock'
				}
				onClick={handleClick}
			/>
			<S.TextField id="passwordField-input" type={showPassword ? 'text' : 'password'} {...rest} />
			{label && <S.Label htmlFor="passwordField-input">{label}</S.Label>}
		</S.TextFieldContainer>
	)
}
