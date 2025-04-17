import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    /* background-color: ${colors.primary[50]}; */
    width: 100%;
    height: 100%;
    min-height: calc(100dvh - 76px);
    overflow: auto;
`

export const Form = styled.form`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 0 20rem;
    padding-bottom: 2rem;
    width: 100%;

    & > button {
        grid-column: span 2;
    }

    @media (max-width: 768px) {
        padding: 1rem;
        grid-template-columns: 1fr;
        width: 80%;
        margin: 0 auto;

        & > button {
            grid-column: 1;
        }
    }
`

export const DropzoneContainer = styled.div`
    height: 100%;
    grid-row: 1 / 5;
    grid-column: 2;

    @media (max-width: 768px) {
        grid-column: 1;
    }
`
