import { FlexCenter } from '@/styles/utils'
import { colors } from '@/styles/variables'
import styled from 'styled-components'
import type { DayButtonProps } from './Calendar.types'

export const CalendarContainer = styled.div`
  position: absolute;
  top: calc(100% - 0.5rem);
  right: 8px;
  max-width: 400px;
  border-radius: 0.5rem;
  z-index: 1;
`

export const Calendar = styled.div`
  background-color: ${colors.white};
  border: 1px solid ${colors.primary[500]};
  border-radius: 0.5rem;
  z-index: 1;
`

export const CalendarPolygon = styled.div`
  position: absolute;
  top: -6px;
  right: 12px;
  width: 15px;
  height: 15px;
  background-color: ${colors.white};
  border: 1px solid ${colors.primary[500]};
  border-radius: 2px;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  transform: rotate(-45deg);
  z-index: -1;
`

export const CalendarHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
`

export const MonthButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

export const CalendarMonth = styled.span`
  min-width: 5.5rem;
  text-align: center;
`

export const WeekDays = styled.section`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  place-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  font-size: 14px;
  font-weight: bold;
`

export const CalendarContent = styled.section`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  place-items: center;
  gap: 0.5rem;
  padding: 1rem;
`

export const MonthButton = styled.button`
  padding: 2px;
  background-color: transparent;
  border: none;
  border-radius: 50%;

  & > div {
    width: 1.5rem;
    height: 1.5rem;
    background-color: ${colors.primary[600]};
  }

  &:hover {
    background-color: ${colors.shadowLight};
    cursor: pointer;
  }
`

export const DayButton = styled.button<DayButtonProps>`
  background-color: ${(props) => (props.$isCurrentDate ? colors.primary[600] : 'transparent')};
  color: ${(props) =>
		props.$isCurrentDate
			? colors.white
			: props.$isAnotherMonth || props.disabled
				? colors.primary[400]
				: colors.black};
  border: none;
  border-radius: 50%;
  cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};

  & > div {
    ${FlexCenter}
    width: 1.5rem;
    height: 1.5rem;
    padding: 1rem;
    background-color: transparent;
    border-radius: 50%;
  }

  & > div:hover {
    background-color: ${(props) => (props.disabled ? 'transparent' : colors.shadowLight)};
  }
`
