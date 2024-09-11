import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const MySpecies = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 1rem;
`

export const Body = styled.div`
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    border: 1px solid ${colors.primary[100]};
    border-radius: 5px;
    height: 100%;
`

export const Title = styled.h2`
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 700;
`

export const Subtitle = styled.p`
    font-size: 1rem;
    font-weight: 400;
    color: ${colors.primary[500]};
`

export const SearchContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    width: 25rem;

    @media (max-width: 768px) {
        width: 100%;
    }
`

export const Form = styled.form`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 2rem;
`

export const Box = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 31%;
    padding: 1rem;
    border: 1px solid ${colors.primary[100]};
    border-radius: 5px;
    
    @media (max-width: 768px) {
        width: 100%;
        padding: 1rem;
        gap: 1rem;
    }
`

export const BoxHeader = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`

export const BoxActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
`

export const DataContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
`

export const DataHeader = styled.h3`
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
`

export const DataBody = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
`
