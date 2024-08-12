import type { CollapseStyleProps } from './Sidebar.types'

import styled from 'styled-components'

export const Sidebar = styled.aside<CollapseStyleProps>`
    display: flex;
    flex-direction: column;
    width: ${({ $collapse }) => ($collapse ? '5rem' : '15rem')};
    min-height: 100%;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
        position: fixed;
        top: 76px;
        left: 0;
        z-index: 1000;
        transition: width 0.3s;
        width: ${({ $collapse }) => ($collapse ? '0' : '15rem')};
    }
`

export const SidebarContent = styled.div`
    flex: 1;
    overflow-y: auto;
`

export const SidebarMenu = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`

export const SidebarMenuItem = styled.li<CollapseStyleProps>`
    display: flex;
    align-items: center;
    ${({ $collapse }) => $collapse && 'justify-content: center;'}
    gap: 1rem;
    padding: 1rem;
    cursor: pointer;
    ${({ $selected }) => $selected && 'background-color: #f0f0f0;'}

    &:hover {
        background-color: #f0f0f0;
    }
`

export const Icon = styled.i<CollapseStyleProps>`
    font-size: ${({ $collapse }) => ($collapse ? '2rem' : '1.5rem')};
`

export const Divider = styled.hr`
    margin: 0;
    border: none;
    border-top: 1px solid #f0f0f0;
    margin: 1rem 0;
`
