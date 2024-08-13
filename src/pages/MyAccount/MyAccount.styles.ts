import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const MyAccount = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
`

export const MyAccountBody = styled.div`
    display: flex;
    flex-direction: column;
    padding: 1rem;
`

export const MyAccountBodyContent = styled.div`
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    border: 1px solid ${colors.primary[100]};
    border-radius: 5px;
`

export const MyAccountBodyTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.25rem;
    font-weight: 700;
`

export const MyAccountBodySubtitle = styled.p`
    font-size: 1rem;
    font-weight: 400;
    color: ${colors.primary[500]};
`

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 2rem;
`

export const ContainerOf3 = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`
