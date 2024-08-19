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
