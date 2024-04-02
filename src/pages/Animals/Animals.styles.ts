import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: calc(100vh - 76px);

    @media (max-width: 768px) {
        height: 100%;
    }
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
