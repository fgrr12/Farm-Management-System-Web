import { FlexCenter } from '@/styles/utils'
import { colors } from '@/styles/variables'
import styled, { css } from 'styled-components'

export const ActionButtonStyles = css`
	${FlexCenter}
	height: 2.5rem;
  	font-size: 14px;
	text-decoration: none;
	background-color: transparent;
	position: relative;
	border: none;
	cursor: pointer;

	&:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
`

export const ActionButton = styled.button`
	${ActionButtonStyles}
`

export const IconStyles = css`
	height: 1.8rem;
	width: 1.8rem;
	margin-right: 0.3rem;
	margin-left: 0.3rem;
	background-color: ${colors.primary[600]};
`

export const Icon = styled.span`
	${IconStyles}
`
