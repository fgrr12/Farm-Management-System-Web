// Types
import type { TextFieldProps } from './TextField.types'

// Styles
import * as S from './TextField.styles'

export const TextField: FC<TextFieldProps> = ({ className, type, label, ...rest }) => {
	return (
		<S.TextFieldContainer className={className}>
			<S.TextField id="textfield-input" type={type} {...rest} />
			{label && <S.Label htmlFor="textfield-input">{label}</S.Label>}
		</S.TextFieldContainer>
	)
}
