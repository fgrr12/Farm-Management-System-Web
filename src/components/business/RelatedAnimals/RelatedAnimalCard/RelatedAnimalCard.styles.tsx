import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Card = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    width: 100%;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border: 1px solid ${colors.primary[200]};
    user-select: none;
    cursor: all-scroll;

    @media (max-width: 768px) {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;

        & > button {
            grid-column: 1 / -1;
        }
    }
`

export const ImageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    border-radius: 0.5rem;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    @media (max-width: 768px) {
        width: 100%;
    }
`

export const MiddleInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    text-align: center;

    p {
        font-size: 1rem;
    }

    @media (max-width: 768px) {
        text-align: center;
    }
`
