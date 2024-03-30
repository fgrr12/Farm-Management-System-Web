import styled from 'styled-components'

export const Container = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr 2fr;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem;
    overflow: auto;
    height: 100vh;

    &::-webkit-scrollbar {
        display: none;
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
    border-radius: 50%;
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

export const RelatedAnimalsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    height: 45vh;

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

export const RelatedAnimalContainer = styled.div`
    display: flex;
    flex-direction: column;
`

export const TableContainer = styled.div`
    display: flex;
    flex-direction: column;
    grid-column: span 3;
    height: 50vh;
`
