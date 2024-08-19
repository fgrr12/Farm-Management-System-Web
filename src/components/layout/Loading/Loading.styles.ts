import { colors } from '@/styles/variables'
import styled, { keyframes } from 'styled-components'

const BackgroundTransparency = keyframes`
	from {
		opacity: 1;
	}
	to {
		opacity: 0.9;
	}
`

export const Loading = styled.dialog`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: transparent;
	border: none;
	overflow: hidden;
	&::backdrop {
		background-color: ${colors.primary[400]};
		animation: ${BackgroundTransparency} 2s ease infinite;
		animation-direction: alternate;
	}
`

const enlargeEveryLetter = keyframes`
	from {
		transform: scale(1);
	}
	to {
		transform: scale(1.2);
	}
`

export const TextContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 50px;
	margin-bottom: 20px;
`

export const Letter = styled.h2`
	color: ${colors.white};
	font-size: 2rem;
	margin: 0 5px;
`

export const Dot = styled.span`
	color: ${colors.white};
	text-align: center;
	font-size: 3rem;
	margin: 0 5px;
	animation: ${enlargeEveryLetter} 1s ease infinite;
	animation-direction: alternate;

	&:nth-child(1) {
		animation-delay: 0s;
	}
	&:nth-child(2) {
		animation-delay: 0.1s;
	}
	&:nth-child(3) {
		animation-delay: 0.2s;
	}
`

export const XSpinner = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100vw;
	height: 100px;
`

const slideInLeft = keyframes`
	from {
		transform: translateX(2rem);
	}
	to {
		transform: translateX(-4rem); 
	}
`

export const Icon = styled.i`
	width: 3rem;
	height: 3rem;
	margin: 0 10px;
	animation: ${slideInLeft} 1s ease infinite;
	animation-direction: alternate;

	&:nth-child(1) {
		animation-delay: 0s;
	}
	&:nth-child(2) {
		animation-delay: 0.1s;
	}
	&:nth-child(3) {
		animation-delay: 0.2s;
	}
	&:nth-child(4) {
		animation-delay: 0.3s;
	}
`
