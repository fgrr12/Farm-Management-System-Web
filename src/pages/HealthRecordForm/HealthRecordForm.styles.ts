import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: ${colors.primary[50]};
    min-height: 100%;
    width: 100%;
`

export const Form = styled.form`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 0 20rem;
    width: 100%;

    & > button {
        grid-column: span 2;
    }

    @media (max-width: 768px) {
        width: 100%;
        padding: 1rem;
        grid-template-columns: 1fr;

        & > button {
            grid-column: 1;
        }
    }
`

export const TextareaContainer = styled.div`
    grid-column: span 2;

    @media (max-width: 768px) {
        grid-column: 1;
    }
`
