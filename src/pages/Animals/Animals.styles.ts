import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
`

export const ButtonContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(25% - 1rem), 1fr));
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem;

    & > button {
        grid-column: 4;
    }

    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;

        & > button {
            width: 100%;
        }
    }
`

export const AnimalsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(25% - 1rem), 1fr));
    gap: 1rem;
    width: 100%;
    padding: 1rem;
    overflow: auto;

    &::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`

export const NoAnimals = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    height: 50%;

    @media (max-width: 768px) {
        padding: 0;
        border: none;
    }
`

export const NoAnimalsTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 500;
`

export const NoAnimalsSubtitle = styled.p`
    font-size: 1rem;
    font-weight: 400;
    color: ${colors.primary[500]};
`
