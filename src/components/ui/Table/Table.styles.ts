import { Box } from '@/styles/box'
import { FlexCenter } from '@/styles/utils'
import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Table = styled.table`
  ${Box}
  padding: 0;
  justify-content: center;
  box-shadow: 0 0 0.9rem ${colors.primary[500]};
  border-radius: 0.5rem;
  background-color: ${colors.white};
  height: 100%;

  &, & * {
    border-collapse: collapse;
  }
`

export const Head = styled.thead`
  width: 100%;
`

export const Body = styled.tbody`
  width: 100%;
  display: block;
  overflow-y: auto;
  height: 100%;
`

export const Row = styled.tr`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  grid-auto-flow: column;
  border-bottom: 1px solid ${colors.primary[400]};

  ${Head} > & {
    &:first-of-type {
      border-bottom: none;
    }
  }

  ${Body} > & {
    border-radius: 0;

    &:first-of-type {
      border-top: 1px solid ${colors.primary[400]};
    }

    &:last-of-type {
      border-radius: 0 0 0.5rem 0.5rem;
      border-bottom: none;
    }

    &:nth-child(odd) {
      background-color: ${colors.primary[100]};
    }
  }
`

export const HeadCell = styled.th`
  ${FlexCenter};
  color: ${colors.primary[950]};
  background-color: ${colors.primary[300]};
  font-size: 0.93rem;
  padding: 1rem 0;
  text-align: center;

  &:first-of-type {
    border-radius: 0.5rem 0 0 0;
    padding-left: 0.75rem;
  }

  &:last-of-type {
    border-radius: 0 0.5rem 0 0;
    padding-right: 0.75rem;
    border-right: none;
  }
`

export const Cell = styled.td`
  ${FlexCenter}
  color: ${colors.primary[800]};
  font-size: 0.93rem;
  gap: 1rem;
  padding: 1.5rem 0;
  text-align: center;

  &:first-of-type {
    padding-left: 0.75rem;
  }

  &:last-of-type {
    padding-right: 0.75rem;
    border-right: none;
  }
`
