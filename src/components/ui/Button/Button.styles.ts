import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Button = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.5rem;
  	padding: 0.5rem 1rem;
  	color: ${colors.black};
	background-color: ${colors.white};
	border: 1px solid ${colors.primary[300]};
	border-radius: 10px;
  	font-size: 14px;
	text-decoration: none;
	border-radius: 0.5rem;
	transition: opacity 0.07s ease-in-out;
	cursor: pointer;
	user-select: none;
  
	&:hover {
		color: ${colors.white};
		border-color: ${colors.primary[300]};
		background-color: ${colors.primary[300]};
	}
  
	&:active {
		opacity: 0.6;
	}
`

export const AddButton = styled(Button)`
    padding: 0.5rem;

    & > div {
        font-size: 1.5rem;
        background-color: ${colors.primary[300]};
    }
    
    &:hover {
        & > div {
            background-color: ${colors.white};
        }
    }
`
