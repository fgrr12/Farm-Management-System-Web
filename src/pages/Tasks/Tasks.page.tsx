import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { Select } from '@/components/ui/Select'

import { AppRoutes } from '@/config/constants/routes'
import { useAppStore } from '@/store/useAppStore'

import * as S from './Tasks.styles'

export const Tasks = () => {
	const { setHeaderTitle } = useAppStore()
	const navigate = useNavigate()

	const handleAddTask = () => {
		navigate(AppRoutes.ADD_TASK)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		setHeaderTitle('Tasks')
	}, [])

	return (
		<S.Container>
			<S.Filters>
				<Search placeholder="Search tasks" />
				<Select label="Status">
					<option value="all">All</option>
					<option value="completed">Completed</option>
					<option value="pending">Pending</option>
				</Select>
				<Select label="Priority">
					<option value="all">All</option>
					<option value="high">High</option>
					<option value="medium">Medium</option>
					<option value="low">Low</option>
				</Select>
				<Select label="Species">
					<option value="all">All</option>
					<option value="cow">Cow</option>
					<option value="pig">Pig</option>
					<option value="chicken">Chicken</option>
				</Select>
				<Button onClick={handleAddTask}>Add Task</Button>
			</S.Filters>
			<S.StatusTitle>Pending</S.StatusTitle>
			<S.TasksList>
				<S.TaskCard>
					<S.Checkbox />
					<S.Task>
						<S.TaskTitle>Task Title</S.TaskTitle>
						<S.TaskDescription>
							Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
							has been the industry's standard dummy text ever since the 1500s, when an unknown
							printer took a galley of type and scrambled it to make a type specimen book. It has
							survived not only five centuries, but also the leap into electronic typesetting,
							remaining essentially unchanged. It was popularised in the 1960s with the release of
							Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
							publishing software like Aldus PageMaker including versions of Lorem Ipsum.
						</S.TaskDescription>
					</S.Task>
					<S.PriorityColor $priority="high" />
				</S.TaskCard>
				<S.TaskCard>
					<S.Checkbox />
					<S.Task>
						<S.TaskTitle>Task Title</S.TaskTitle>
						<S.TaskDescription>Task Description</S.TaskDescription>
					</S.Task>
					<S.PriorityColor $priority="medium" />
				</S.TaskCard>
				<S.TaskCard>
					<S.Checkbox />
					<S.Task>
						<S.TaskTitle>Task Title</S.TaskTitle>
						<S.TaskDescription>Task Description</S.TaskDescription>
					</S.Task>
					<S.PriorityColor />
				</S.TaskCard>
				<S.TaskCard>
					<S.Checkbox />
					<S.Task>
						<S.TaskTitle>Task Title</S.TaskTitle>
						<S.TaskDescription>Task Description</S.TaskDescription>
					</S.Task>
					<S.PriorityColor $priority="low" />
				</S.TaskCard>
				<S.TaskCard>
					<S.Checkbox />
					<S.Task>
						<S.TaskTitle>Task Title</S.TaskTitle>
						<S.TaskDescription>Task Description</S.TaskDescription>
					</S.Task>
					<S.PriorityColor $priority="high" />
				</S.TaskCard>
			</S.TasksList>

			<S.StatusTitle>Completed</S.StatusTitle>
			<S.TasksList>
				<S.TaskCard>
					<S.Checkbox />
					<S.Task>
						<S.TaskTitle>Task Title</S.TaskTitle>
						<S.TaskDescription>Task Description</S.TaskDescription>
					</S.Task>
					<S.PriorityColor $priority="high" />
				</S.TaskCard>
				<S.TaskCard>
					<S.Checkbox />
					<S.Task>
						<S.TaskTitle>Task Title</S.TaskTitle>
						<S.TaskDescription>Task Description</S.TaskDescription>
					</S.Task>
					<S.PriorityColor $priority="medium" />
				</S.TaskCard>
			</S.TasksList>
		</S.Container>
	)
}
