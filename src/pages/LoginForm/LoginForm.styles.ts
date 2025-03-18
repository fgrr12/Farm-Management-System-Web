import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100dvh;
    width: 100%;
`

export const Card = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3rem;
    width: 400px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;

    @media (max-width: 768px) {
        width: 100%;
        padding: 1rem;
        border: none;
    }
`

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 2rem;
`

export const Title = styled.h1`
    text-align: center;
`

export const ForgotPassword = styled(Link)`
    color: #333;
    text-decoration: none;
`

export const Or = styled.p`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;

    &::before,
    &::after {
        content: '';
        display: inline-block;
        width: 100%;
        height: 1px;
        background-color: #333;
    }
`

export const GoogleButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    color: #333;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        background-color: #f1f1f1;
    }
`
