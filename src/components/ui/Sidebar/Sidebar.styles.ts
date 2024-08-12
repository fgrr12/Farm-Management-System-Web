import styled from 'styled-components'

export const Sidebar = styled.aside`
    display: flex;
    flex-direction: column;
    width: 15rem;
    height: 100vh;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`

export const SidebarHeader = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #f0f0f0;
`

export const SidebarTitle = styled.h1`
    font-size: 1.5rem;
    font-weight: 500;
`

export const SidebarCloseButton = styled.div`
    cursor: pointer;
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

export const SidebarMenuItem = styled.li`
    display: flex;
    align-items: center;
    padding: 1rem;
    cursor: pointer;

    &:hover {
        background-color: #f0f0f0;
    }
`

export const Icon = styled.i`
    font-size: 1.25rem;
    margin-right: 1rem;
`
