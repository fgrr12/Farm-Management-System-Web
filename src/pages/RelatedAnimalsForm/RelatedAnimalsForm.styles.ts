import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
`

export const AnimalsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(15% - 1rem), 1fr));
    gap: 1rem;
    width: 100%;
    padding: 1rem;
    overflow: auto;
    height: calc(50vh - 100px);

    &::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`

export const RelatedAnimalsContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    width: 100%;
    height: 50vh;
    padding: 1rem;
    
`

export const DragZone = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    flex-grow: 1;
    justify-content: center;
    gap: 0 1rem;
    width: 100%;
    height: 100%;
    border: 2px dashed ${colors.primary[200]};
    border-radius: 0.5rem;
    padding: 1rem;

    & > div {
        width: calc(50% - 1rem);
        height: 200px;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
        padding: 0.5rem;

        & > div {
            width: 100%;
        }
    }
`

export const Title = styled.h2`
    font-size: 1.5rem;
    font-weight: bold;
    color: ${colors.primary[500]};
    text-align: center;
`
