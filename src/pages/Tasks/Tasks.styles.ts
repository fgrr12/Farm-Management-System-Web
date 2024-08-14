import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    width: 100%;
    height: 100%;
`

export const Filters = styled.div`
    display: grid;
    justify-content: center;
    align-items: center;
    grid-template-columns: repeat(6, 1fr);
    gap: 1rem;

    & > button {
        grid-column: 6;
        height: 80%;
        width: 100%;
    }

    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;

        & > button {
            height: auto;
        }
    }
`

export const TasksList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
`

export const StatusTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 500;
`

export const TaskCard = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #ccc;
    width: 100%;
`

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
    width: 1.5rem;
    height: 1.5rem;
`

export const Task = styled.div`
    display: flex;
    flex-direction: column;
    width: 90%;

    @media (max-width: 768px) {
        width: 85%;
    }
`

export const TaskTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 500;
`

export const TaskDescription = styled.p`
    font-size: 1rem;
    font-weight: 400;
`

export const PriorityColor = styled.div<{ $priority?: string }>`
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 6%;
    height: 100%;
    border-radius: 0 0.5rem 0.5rem 0;
    background-color: ${({ $priority }) => {
			switch ($priority) {
				case 'high':
					return 'red'
				case 'medium':
					return 'yellow'
				case 'low':
					return 'green'
				default:
					return 'gray'
			}
		}};
`

export const NoTasks = styled.p`
    font-size: 1.5rem;
    font-weight: 500;
    text-align: center;
`
