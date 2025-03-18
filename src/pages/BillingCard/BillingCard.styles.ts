import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100dvh;
`

export const Card = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 400px;
    height: auto;
    border: 4px solid black;
    border-radius: 10px;
    padding: 10px;
`

export const H3 = styled.h3`
    text-align: center;
    font-size: 16px;
`

export const DataContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;

    h3 {
        font-size: 18px;
    }

    span {
        font-size: 18px;
        font-weight: 500;

    }
`

export const Img = styled.img`
    position: absolute;
    bottom: 45px;
    right: 15px;
    width: 25%;
    height: auto;
    border-radius: 10px;
`
