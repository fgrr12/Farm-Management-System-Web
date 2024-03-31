import * as S from './Select.styles'
import { SelectProps } from './Select.types'

export const Select: FC<SelectProps> = ({ className, ...rest }) => {
	return (
		<S.DropdownContainer className={className}>
			<S.Label>{rest.label}</S.Label>
			<S.Dropdown {...rest} />
			<S.Arrow className="i-ic-outline-arrow-drop-down" />
		</S.DropdownContainer>
	)
}
