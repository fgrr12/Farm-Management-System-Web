import { FC, ReactElement } from 'react'
import type { TextareaProps } from './Textarea.types'
import * as S from './Textarea.styles'

export const Textarea: FC<TextareaProps> = ({ label, ...rest }): ReactElement => {
	return (
		<S.TextareaContainer>
			<S.Textarea {...rest} />
			<S.Label>{label}</S.Label>
		</S.TextareaContainer>
	)
}
