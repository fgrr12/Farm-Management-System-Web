import { type ChangeEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { Select } from '@/components/ui/Select'

import { AppRoutes } from '@/config/constants/routes'
import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { TasksService } from '@/services/tasks'

import type { DividedTasks, TaskFilters } from './Tasks.types'

import * as S from './Tasks.styles'

export const Tasks = () => {
	const { setHeaderTitle } = useAppStore()
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const navigate = useNavigate()

	const [tasks, setTasks] = useState(INITIAL_TASKS)
	const [filters, setFilters] = useState(INITIAL_FILTERS)

	const handleAddTask = () => {
		navigate(AppRoutes.ADD_TASK)
	}

	const handleDebounceSearch = (event: ChangeEvent<HTMLInputElement>) => {
		setFilters((prev) => ({ ...prev, search: event.target.value }))
	}

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setFilters((prev) => ({ ...prev, [name]: value }))
	}

	const handleUpdateTask = (task: Task) => async () => {
		const status = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
		await TasksService.updateTaskStatus(task.uuid, status)
		await getTasks()
	}

	const getTasks = async () => {
		try {
			const { search, status, priority, species } = filters
			const farmUuid = farm!.uuid
			const tasks = await TasksService.getTasks({ search, status, priority, species, farmUuid })
			const pendingTasks = tasks.filter((task) => task.status === 'PENDING')
			const completedTasks = tasks.filter((task) => task.status === 'COMPLETED')
			setTasks({ pending: pendingTasks, completed: completedTasks })
		} catch (error) {
			console.error(error)
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		setHeaderTitle('Tasks')
		if (!user) {
			navigate(AppRoutes.LOGIN)
			return
		}
	}, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect used to update tasks list
	useEffect(() => {
		if (user) {
			getTasks()
		}
	}, [filters.priority, filters.species, filters.status])

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only called once
	useEffect(() => {
		const debounceId = setTimeout(() => {
			getTasks()
		}, 500)
		return () => clearTimeout(debounceId)
	}, [filters.search])

	return (
		<S.Container>
			<S.Filters>
				<Search placeholder="Search tasks" onChange={handleDebounceSearch} />
				<Select name="status" label="Status" onChange={handleSelectChange}>
					<option value="">All</option>
					<option value="COMPLETED">Completed</option>
					<option value="PENDING">Pending</option>
				</Select>
				<Select name="priority" label="Priority" onChange={handleSelectChange}>
					<option value="">All</option>
					<option value="high">High</option>
					<option value="medium">Medium</option>
					<option value="low">Low</option>
				</Select>
				<Select name="species" label="Species" onChange={handleSelectChange}>
					<option value="">All</option>
					{farm?.species.map((species, index) => (
						<option key={index} value={species}>
							{species}
						</option>
					))}
				</Select>
				<Button onClick={handleAddTask}>Add Task</Button>
			</S.Filters>

			{filters.status !== 'COMPLETED' && (
				<>
					<S.StatusTitle>Pending</S.StatusTitle>
					<S.TasksList>
						{tasks.pending.map((task) => (
							<S.TaskCard key={task.uuid}>
								<S.Checkbox onChange={handleUpdateTask(task)} />
								<S.Task>
									<S.TaskTitle>{task.title}</S.TaskTitle>
									<S.TaskDescription>{task.description}</S.TaskDescription>
								</S.Task>
								<S.PriorityColor $priority={task.priority} />
							</S.TaskCard>
						))}
						{tasks && tasks.pending.length === 0 && <S.NoTasks>No tasks found</S.NoTasks>}
					</S.TasksList>
				</>
			)}

			{filters.status !== 'PENDING' && (
				<>
					<S.StatusTitle>Completed</S.StatusTitle>
					<S.TasksList>
						{tasks.completed.map((task) => (
							<S.TaskCard key={task.uuid}>
								<S.Checkbox onChange={handleUpdateTask(task)} checked />
								<S.Task>
									<S.TaskTitle>{task.title}</S.TaskTitle>
									<S.TaskDescription>{task.description}</S.TaskDescription>
								</S.Task>
								<S.PriorityColor $priority={task.priority} />
							</S.TaskCard>
						))}
						{tasks && tasks.completed.length === 0 && <S.NoTasks>No tasks found</S.NoTasks>}
					</S.TasksList>
				</>
			)}
		</S.Container>
	)
}

const INITIAL_TASKS: DividedTasks = { pending: [], completed: [] }

const INITIAL_FILTERS: TaskFilters = {
	search: '',
	status: '',
	priority: '',
	species: '',
}
