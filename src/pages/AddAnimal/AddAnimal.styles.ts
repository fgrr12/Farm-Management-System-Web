import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: ${colors.primary[50]};
    height: 100vh;
`

export const Form = styled.form`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 0 20rem;

    & > button {
        grid-column: span 2;
    }
`

export const DropzoneContainer = styled.div`
    height: 100%;
    grid-row: 1 / 4;
    grid-column: 2;
`

export const TextFieldContainer = styled.div`
    grid-column: span 3;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
`
