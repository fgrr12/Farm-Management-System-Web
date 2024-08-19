import { colors, shadows } from '@/styles/variables'
import styled from 'styled-components'

export const TextareaContainer = styled.div`
  position: relative;
  display: inline-block;
  min-height: 3.5rem;
  width: 100%;
  user-select: none;
`

export const Textarea = styled.textarea`
  height: 100%;
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.3;
  resize: vertical;
  border: 1px solid ${colors.primary[500]};
  border-radius: 0.5rem;
  box-shadow: ${shadows.container};
  -ms-overflow-style: none;
  scrollbar-width: none;

  &:hover {
    border: 1px solid ${colors.primary[500]};
  }
  
  &:focus, &:active {
    border: 1px solid ${colors.primary[600]};
  }

  &:disabled {
    background-color: ${colors.shadowBasic};
    border: 1px solid ${colors.primary[300]};
    cursor: not-allowed;
  }

  &::-webkit-scrollbar {
    display: none;
    scrollbar-width: none;
  }
`

export const Label = styled.label`
  position: absolute;
  left: 0.6rem;
  font-size: 0.8rem;
  transform: translateY(-.5rem);
  color: ${colors.primary[600]};
  background-color: ${colors.white};
  border-radius: 6px;
  padding: 0 0.3rem;
`
