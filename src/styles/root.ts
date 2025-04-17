import styled from 'styled-components'

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100dvh;
`

export const AppContent = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`
