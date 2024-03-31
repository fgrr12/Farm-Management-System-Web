import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    height: 100%;
    padding: 1rem 2rem;
    overflow: auto;
    background-color: ${colors.primary[50]};

    &::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 768px) {
        padding: 1rem;
        gap: 1rem;
    }
`

export const AnimalContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 1rem 0;

    @media (max-width: 768px) {
        display: flex;
        flex-direction: column-reverse;
        gap: 1rem;
        padding: 0;
    }
`

export const ImageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`

export const Image = styled.img`
    width: 16rem;
    height: 16rem;
    border-radius: 1rem;
    object-fit: cover;
`

export const Label = styled.span`
    font-weight: bold;
    text-align: center;
`

export const Value = styled.span`
    text-align: center;
`

export const InfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`

export const AnimalInfo = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    & > div {
        display: flex;
        flex-direction: column;
    }
`

export const TableContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    & > table {
        max-height: 50vh;
        height: auto;
    }
`

export const CenterTitle = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    & > span {
        padding: 0.5rem;
    }
`

export const InfoTableContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;

    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
`
