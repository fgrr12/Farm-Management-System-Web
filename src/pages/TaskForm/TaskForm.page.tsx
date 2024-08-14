import { type ChangeEvent, type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TextField } from '@/components/ui/TextField'

import * as S from './TaskForm.styles'

export const TaskForm = () => {
	const [task, setTask] = useState(INITIAL_TASK)

	const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = event.target
		setTask((prev) => ({ ...prev, [name]: value }))
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setTask((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault()
		console.log(task)
	}

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
					<option value="low">Low</option>
					<option value="medium">Medium</option>
					<option value="high">High</option>
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
	priority: 'low',
	status: 'pending',
}
