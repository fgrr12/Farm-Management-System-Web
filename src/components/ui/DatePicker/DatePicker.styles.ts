import { colors, shadows } from '@/styles/variables'
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
    background-color: ${colors.white};
    border-color: ${colors.primary[500]};
    border-radius: 0.5rem;
    box-shadow: ${shadows.container};
    cursor: default;

    &:hover, &:focus {
        border: 2px solid ${colors.primary[500]};
    }

    &:disabled {
        background-color: ${colors.shadowBasic};
        border: 1px solid;
        border-color: ${colors.primary[300]};
    }

    @media (max-width: 768px) {
        min-width: 95%;
        width: 100%;
        padding: 1rem;
    }
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
    top: 0rem;
    left: 0.6rem;
    font-size: 0.8rem;
    transform: translateY(-.5rem);
    color: ${colors.primary[600]};
    background-color: ${colors.white};
    border-radius: 6px;
    padding: 0 0.3rem;
`
