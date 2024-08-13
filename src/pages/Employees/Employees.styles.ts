import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    width: 100%;
    height: 100%;
`

export const HeaderContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(33% - 1rem), 1fr));
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem;

    & > button {
        grid-column: 3;
    }

    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;

        & > button {
            width: 100%;
        }
    }
`
