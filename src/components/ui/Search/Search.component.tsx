// Types
import type { SearchProps } from './Search.types'

// Styles
import * as S from './Search.styles'

export const Search: FC<SearchProps> = ({ className, ...rest }) => {
	return (
		<S.TextFieldContainer className={className}>
			<S.TextField id="search-input" type="text" autoComplete="off" {...rest} />
			<S.Label htmlFor="search-input">{rest.placeholder}</S.Label>
			<S.Icon className="i-ph-magnifying-glass-duotone" />
		</S.TextFieldContainer>
	)
}
