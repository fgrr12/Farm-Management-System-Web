import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Loading = styled.dialog`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: transparent;
	border: none;
	overflow: hidden;
	&::backdrop {
		background-color: rgba(0, 0, 0, 0.35);
	}
`

export const Spinner = styled.div`
	width: 5rem;
	height: 5rem;
	border: 0.5rem solid ${colors.primary[600]};
	border-top-color: transparent;
	border-radius: 50%;
	animation: spin 1.5s linear infinite;
`
