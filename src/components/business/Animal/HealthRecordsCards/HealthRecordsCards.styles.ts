import styled from 'styled-components'

export const CardsContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    & > table {
        max-height: 50vh;
        height: auto;
    }

    @media (max-width: 768px) {
        & > table {
            height: auto;
            max-height: 100%;
        }
    }
`

export const Label = styled.span`
    font-weight: bold;
    text-align: center;
`

export const CenterTitle = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    & > span {
        padding: 0.5rem;
    }
`

export const CardContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
`

export const Card = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 100%;
`

export const CardTitle = styled.span`
    font-weight: bold;
`

export const CardContent = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    gap: 1rem;

    & > div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
    }
`

export const CardLabel = styled.span`
    font-weight: bold;
`

export const CardValue = styled.span`
    text-align: center;
`

export const CardActions = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
`
