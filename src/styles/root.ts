import styled from 'styled-components'

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
`

export const AppContent = styled.div<{ $topHeaderHeight: number }>`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - ${({ $topHeaderHeight }) => $topHeaderHeight}px);

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`
