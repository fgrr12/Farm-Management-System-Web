import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
`

export const ButtonContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    padding: 1rem;
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
