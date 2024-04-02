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
  padding-right: 3rem;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  border-bottom: 1px solid ${colors.primary[500]};
  box-shadow: ${shadows.container};

  &:hover {
    border-bottom: 2px solid ${colors.primary[500]};
  }

  &:focus, &:active {
    border-bottom: 2px solid ${colors.primary[600]};
  }

  &::placeholder {
    color: transparent;
  }

  &:disabled {
    background-color: #d6d6d6;
    border-bottom: 1px solid ${colors.primary[400]};
    cursor: not-allowed;
  }
`

export const Icon = styled.span`
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  top: 1rem;
  right: .8rem;
  background-color: ${colors.primary[600]};
  transition: transform 0.25s ease-in-out;
  pointer-events: none;
`

export const Label = styled.label`
  position: absolute;
  left: 1rem;
  font-size: 1rem;
  color: ${colors.primary[950]};
  transform: translateY(1rem);
  transition: transform 0.25s ease-in-out;
  text-transform: capitalize;
  cursor: text;

  ${TextField}:focus + &,
  ${TextField}:not(:placeholder-shown) + & {
    font-size: 0.8rem;
    transform: translateY(-.5rem);
    color: ${colors.primary[600]};
    background-color: ${colors.white};
    border-radius: 6px;
    padding: 0 0.3rem;
  }
`
