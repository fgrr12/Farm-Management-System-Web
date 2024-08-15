import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
`

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2rem;
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

export const PriorityOption = styled.option<{ $priority: string }>`
    background-color: ${({ $priority }) => {
			switch ($priority) {
				case 'low':
					return 'green'
				case 'medium':
					return 'orange'
				case 'high':
					return 'red'
				default:
					return 'grey'
			}
		}};
`
