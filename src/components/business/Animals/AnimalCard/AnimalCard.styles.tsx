import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Card = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: start;
    gap: 2rem;
    width: 100%;
    padding: 2rem 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border: 1px solid ${colors.primary[200]};
    user-select: none;

    @media (max-width: 768px) {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;

        & > button {
            grid-column: 1 / -1;
        }
    }
`

export const TopInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;

    h2 {
        font-size: 1.8rem;
        font-weight: 500;
    }

    h5 {
        font-size: 1rem;
        font-weight: 500;
        color: ${colors.primary[600]};
    }

    @media (max-width: 768px) {
        text-align: center;
    }
`

export const MiddleInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;

    p {
        font-size: 1rem;
    }

    @media (max-width: 768px) {
        text-align: center;
    }
`
