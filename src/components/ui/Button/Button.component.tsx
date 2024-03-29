// Types
import type { ButtonProps } from './Button.types'

// Styles
import * as S from './Button.styles'

export const Button: FC<ButtonProps> = ({ children, ...props }) => {
	return <S.Button {...props}>{children}</S.Button>
}

export const AddButton: FC<ButtonProps> = ({ ...props }) => {
	return (
		<S.AddButton {...props}>
			<div className="i-material-symbols-add" />
		</S.AddButton>
	)
}
