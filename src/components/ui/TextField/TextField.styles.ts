import { colors, shadows } from '@/styles/variables'
import styled from 'styled-components'

export const TextFieldContainer = styled.div`
  position: relative;
  display: inline-block;
  height: 3.5rem;
  width: 100%;
  user-select: none;
`

export const TextField = styled.input`
  width: 100%;
  height: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 1px solid;
  border-color: ${colors.primary[500]};
  border-radius: 0.5rem;
  box-shadow: ${shadows.container};

  &:hover {
    border: 2px solid ${colors.primary[500]};
  }

  &:focus, &:active {
    border: 2px solid ${colors.primary[600]};
  }

  &:disabled {
    background-color: ${colors.shadowBasic};
    border: 1px solid;
    border-color: ${colors.primary[300]};
    cursor: not-allowed;
  }
`

export const Label = styled.label`
  position: absolute;
  left: 0.6rem;
  font-size: 0.8rem;
  transform: translateY(-.5rem);
  color: ${colors.primary[600]};
  background-color: ${colors.white};
  border-radius: 6px;
  padding: 0 0.3rem;
`

export const PasswordIcon = styled.div`
  position: absolute;
  top: 50%;
  right: 0.3rem;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  background-color: ${colors.primary[600]};
  filter: drop-shadow(0 0 10px ${colors.shadowBasic});
  cursor: pointer;
`
