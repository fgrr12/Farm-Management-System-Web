import { colors, shadows } from '@/styles/variables'
import styled from 'styled-components'

export const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  height: 3.5rem;
  width: 100%;
`

export const Dropdown = styled.select`
  width: 100%;
  height: 100%;
  padding: 1rem;
  padding-right: 3rem;
  font-size: 1rem;
  border: 1px solid ${colors.primary[500]};
  border-radius: 0.5rem;
  box-shadow: ${shadows.container};
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  background-color: white;

  &:disabled {
    background-color: ${colors.shadowBasic};
    border: 1px solid;
    border-color: ${colors.primary[400]};
    color: ${colors.primary[950]};
    cursor: not-allowed;
  }

  &:hover {
    border: 2px solid ${colors.primary[500]};
  }

  &:focus, &:active {
    border: 2px solid ${colors.primary[600]};
  }
`

export const ClearButton = styled.button`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  width: 1.8rem;
  height: 1.8rem;
  background-color: transparent;
  border: none;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`

export const CircleX = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${colors.primary[600]};
  filter: drop-shadow(${shadows.container});
  pointer-events: none;
`

export const Arrow = styled.div`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  width: 1.8rem;
  height: 1.8rem;
  background-color: ${colors.primary[600]};
  filter: drop-shadow(${shadows.container});
  pointer-events: none;
`

export const Label = styled.label`
  position: absolute;
  top: -1.1rem;
  left: 0.7rem;
  transform: translateY(50%);
  background-color: ${colors.white};
  padding: 0 0.3rem;
  font-size: .8rem;
  color: ${colors.primary[600]};
  border-radius: 5px;
  user-select: none;
  z-index: 99;
`

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
`
