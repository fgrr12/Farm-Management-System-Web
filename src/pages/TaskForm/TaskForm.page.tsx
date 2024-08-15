import { AppRoutes } from '@/config/constants/routes'
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import { TasksService } from '@/services/tasks'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import * as S from './TaskForm.styles'

export const TaskForm = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const { setHeaderTitle } = useAppStore()
	const navigate = useNavigate()

	const [task, setTask] = useState(INITIAL_TASK)

	const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.target
		setTask((prev) => ({ ...prev, [name]: value }))
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setTask((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()
		task.uuid = task.uuid || crypto.randomUUID()
		await TasksService.setTask(task, user!.uuid, farm!.uuid)
		navigate(AppRoutes.TASKS)
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		setHeaderTitle('Add Task')
	}, [])

	return (
		<S.Container>
			<S.Form onSubmit={handleSubmit} autoComplete="off">
				<TextField
					name="title"
					type="text"
					placeholder="Task Title"
					label="Task Title"
					value={task.title}
					onChange={handleTextChange}
					required
				/>
				<Textarea
					name="description"
					placeholder="Task Description"
					label="Task Description"
					value={task.description}
					onChange={handleTextChange}
					required
				/>
				<Select
					name="priority"
					label="Priority"
					value={task.priority}
					onChange={handleSelectChange}
					required
				>
					<option value="" disabled>
						Select a priority
					</option>
					<S.PriorityOption $priority="low">Low</S.PriorityOption>
					<S.PriorityOption $priority="medium">Medium</S.PriorityOption>
					<S.PriorityOption $priority="high">High</S.PriorityOption>
				</Select>
				<Select
					name="species"
					label="Species"
					value={task.species}
					onChange={handleSelectChange}
					required
				>
					<option value="" disabled>
						Select a species
					</option>
					{farm?.species.map((species, index) => (
						<option key={index} value={species}>
							{species}
						</option>
					))}
				</Select>
				<Button type="submit">Add Task</Button>
			</S.Form>
		</S.Container>
	)
}

const INITIAL_TASK: Task = {
	uuid: '',
	title: '',
	description: '',
	priority: '',
	status: 'PENDING',
	species: '',
	farmUuid: '',
}
