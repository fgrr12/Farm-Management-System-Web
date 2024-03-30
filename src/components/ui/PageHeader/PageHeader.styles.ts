import { H1 } from '@/styles/titles'
import { colors, shadows } from '@/styles/variables'
import styled from 'styled-components'

export const PageHeader = styled.header`
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr auto;
    padding: 1rem;
    border-bottom: 1px solid ${colors.primary[600]};
    background-color: ${colors.white};
    box-shadow: ${shadows.container};
    width: 100%;

    @media (max-width: 768px) {
        display: flex;
        justify-content: center;
        align-items: start;
        flex-direction: column-reverse;
    }
`

export const Title = styled(H1)`
    justify-self: center;
    color: ${colors.primary[700]};
    margin-left: -105px;

    @media (max-width: 768px) {
        margin-left: 0;
    }
`
