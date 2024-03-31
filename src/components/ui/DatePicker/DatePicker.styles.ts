import { FlexCenter } from '@/styles/utils'
import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const DatePickerContainer = styled.div`
  position: relative;
  display: inline-block;
  height: 3.5rem;
  width: 100%;
`

export const DatePicker = styled.input`
  width: 100%;
  height: 100%;
  padding: 1rem;
  padding-right: 3.5rem;
  font-size: 1rem;
  border: 1px solid;
  border-color: ${colors.primary[500]};
  border-radius: 0.5rem;
  box-shadow: ${colors.shadowBasic};
  cursor: default;

  &:disabled {
    background-color: ${colors.shadowBasic};
    border: 1px solid;
    border-color: ${colors.primary[300]};
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

export const CalendarButton = styled.button`
  ${FlexCenter}
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  width: 2.5rem;
  height: 2.5rem;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  transition: background-color 0.3, ease-in-out;
  pointer-events: painted;

  &:hover {
    cursor: pointer;
  }
  
  &:active {
    filter: brightness(0.92);
  }
`

export const CalendarIcon = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  background-color: ${colors.primary[600]};
  filter: drop-shadow(0 0 10px ${colors.shadowBasic});
`
