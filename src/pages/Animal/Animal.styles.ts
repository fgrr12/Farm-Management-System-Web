import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2rem;
    width: 100%;
    padding: 1rem;
    overflow: auto;
    background-color: ${colors.primary[50]};

    &::-webkit-scrollbar {
        display: none;
    }
`

export const AnimalContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 2rem 0;
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

    & > div {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;

        & > div {
            display: flex;
            flex-direction: column;
        }
    }
`

export const TableContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;

    & > table {
        max-height: 50vh;
        height: auto;
    }
`
