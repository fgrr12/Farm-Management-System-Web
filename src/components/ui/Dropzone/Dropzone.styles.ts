import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const DropzoneContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px ${colors.primary[400]} solid;
    border-radius: 0.5rem;
    transition: border-color 0.3s ease;
    cursor: pointer;
    
    &:hover {
        border-color: ${colors.primary[500]};
    }
`

export const Dropzone = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
`

export const Label = styled.label`
    text-align: center;
    font-size: 1.5rem;
    color: ${colors.primary[600]};
    cursor: pointer;
`

export const DropzoneInput = styled.input`
    width: 100%;
    height: 100%;
    opacity: 0;
    position: absolute;
    z-index: -1;
`

export const Icon = styled.div`
	width: 4rem;
	height: 4rem;
	pointer-events: none;
    background-color: ${colors.primary[600]};
`

export const RemoveIconContainer = styled.div`
    position: absolute;
    top: 0.3rem;
    right: 0.3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.5rem;
    border: 1px solid ${colors.primary[500]};
    background-color: ${colors.white};
    cursor: pointer;
    z-index: 1;

    &:hover {
        background-color: ${colors.primary[600]};
    }
`

export const RemoveIcon = styled.div`
    width: 2rem;
	height: 2rem;
    background-color: ${colors.primary[600]};
    padding: 0.2rem;

    &:hover {
        background-color: ${colors.white};
    }
`

export const FileName = styled(Label).attrs({ as: 'p' })`
	margin: 0;
	word-wrap: break-word;
	word-break: break-word;
	pointer-events: none;
`

export const Img = styled.img`
    width: 100%;
    height: 100%;
    max-height: 400px;
    max-width: 400px;
    object-fit: fill;
    border-radius: 0.5rem;

    @media screen and (max-width: 768px) {
        max-height: 300px;
        max-width: 300px;
    }
`
