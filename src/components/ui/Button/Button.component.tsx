// Types
import type { ButtonProps } from './Button.types'

// Styles
import * as S from './Button.styles'

export const Button: FC<ButtonProps> = ({ children, ...props }) => {
	return <S.Button {...props}>{children}</S.Button>
}

export const BackButton: FC<ButtonProps> = (props) => {
	return (
		<S.BackButton {...props}>
			<S.Icon className="i-material-symbols-arrow-left-alt-rounded" />
			{props.children}
		</S.BackButton>
	)
}
