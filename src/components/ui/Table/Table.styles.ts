import { FlexCenter } from '@/styles/utils'
import { colors } from '@/styles/variables'
import styled from 'styled-components'

export const Table = styled.table`
  width: 100%;
  padding: 0;
  justify-content: center;
  box-shadow: 0 0 0.9rem ${colors.primary[500]};
  border-radius: 0.5rem;
  background-color: ${colors.white};
  height: 100%;

  &, & * {
    border-collapse: collapse;
  }

  @media only screen and (max-width: 768px) {
	
    /* Force table to not be like tables anymore */
    thead, 
    tbody, 
    th, 
    td, 
    tr { 
      display: block; 
    }
  
    /* Hide table headers (but not display: none;, for accessibility) */
    thead tr { 
      position: absolute;
      top: -9999px;
      left: -9999px;
    }
  
    tr { 
      border: 1px solid #ccc; 
      &:first-of-type {
        border-radius: 0.5rem 0.5rem 0 0;
      }
    }
  
     td { 
      /* Behave  like a "row" */
      border: none;
      border-bottom: 1px solid #eee; 
      position: relative;
      padding-left: 50% !important; 
      white-space: normal;
      text-align:left;
    }
  
    td:before { 
      /* Now like a table header */
      position: absolute;
      /* Top/left values mimic padding */
      top: 6px;
      left: 6px;
      width: 45%; 
      padding-right: 10px; 
      white-space: nowrap;
      text-align:left;
      font-weight: bold;
    }
  
    /*
    Label the data
    */
    td:before { content: attr(data-title); }
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

export const Row = styled.tr<{ $type?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(1rem, 1fr));
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
      background-color: ${({ $type }) => {
				switch ($type) {
					case 'Birth':
						return colors.pink
					case 'Drying':
						return colors.yellow
					default:
						return colors.primary[100]
				}
			}};
    }
    
    background-color: ${({ $type }) => {
			switch ($type) {
				case 'Birth':
					return colors.pink
				case 'Drying':
					return colors.yellow
			}
		}};
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
  padding: 1.2rem 0;
  text-align: center;

  &:first-of-type {
    padding-left: 0.75rem;
  }

  &:last-of-type {
    padding-right: 0.75rem;
    border-right: none;
  }
`
