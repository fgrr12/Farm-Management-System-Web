import styled from 'styled-components'

import type { BackButtonHiddenProps, CollapsePageStyleProps } from './PageHeader.types'

import { H1 } from '@/styles/titles'
import { colors, shadows } from '@/styles/variables'

export const PageHeader = styled.header<BackButtonHiddenProps>`
    display: grid;
    align-items: center;
    grid-template-columns: ${({ $backButtonHidden }) => ($backButtonHidden ? 'auto 1fr' : 'auto auto 1fr')};
    padding: 1rem;
    background-color: ${colors.white};
    box-shadow: ${shadows.container};
    width: 100%;

    @media (max-width: 768px) {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column-reverse;
        padding: 0.5rem;
    }
`

export const Sidebar = styled.div<CollapsePageStyleProps>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-right: 1px solid ${colors.primary[600]};
    width: ${({ $collapse }) => ($collapse ? '4rem' : '12rem')};
    height: 100%;
    cursor: pointer;
    user-select: none;
    ${({ $backButtonHidden }) => !$backButtonHidden && 'margin-right: 1rem;'}

    &:hover {
        background-color: ${colors.primary[100]};
    }

    @media (max-width: 768px) {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1000;
        height: ${({ $backButtonHidden }) => ($backButtonHidden ? '3rem' : '5.5rem')};
        width: ${({ $collapse }) => ($collapse ? '3rem' : '15rem')};
        transition: width 0.3s;
        background-color: ${({ $collapse }) => ($collapse ? 'transparent' : colors.white)};
    }
`

export const SidebarTitle = styled.h1`
    font-size: 1.5rem;
    font-weight: 500;
`

export const SidebarCloseButton = styled.div``

export const Title = styled(H1)`
    justify-self: center;
    color: ${colors.primary[700]};
    margin-left: -105px;

    @media (max-width: 768px) {
        margin-left: 0;
        font-size: 1.5rem;
    }
`
