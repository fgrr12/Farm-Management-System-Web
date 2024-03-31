import styled from 'styled-components'

export const TableContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    & > table {
        max-height: 50vh;
        height: auto;
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
