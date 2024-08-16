import { type ChangeEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const { setHeaderTitle, setLoading } = useAppStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['tasks'])

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
			setLoading(true)
			const { search, status, priority, species } = filters
			const farmUuid = farm!.uuid
			const tasks = await TasksService.getTasks({ search, status, priority, species, farmUuid })
			const pendingTasks = tasks.filter((task) => task.status === 'PENDING')
			const completedTasks = tasks.filter((task) => task.status === 'COMPLETED')
			setTasks({ pending: pendingTasks, completed: completedTasks })
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false)
		}
	}
	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect used to update tasks list
	useEffect(() => {
		setHeaderTitle(t('title'))
		if (user) getTasks()
	}, [user, filters.priority, filters.species, filters.status])

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect is only watching for search changes
	useEffect(() => {
		const debounceId = setTimeout(() => {
			if (filters.search !== '') getTasks()
		}, 500)
		return () => clearTimeout(debounceId)
	}, [filters.search])

	return (
		<S.Container>
			<S.Filters>
				<Search placeholder={t('search')} onChange={handleDebounceSearch} />
				<Select name="status" label={t('status')} onChange={handleSelectChange}>
					<option value="">{t('all')}</option>
					<option value="COMPLETED">{t('completed')}</option>
					<option value="PENDING">{t('pending')}</option>
				</Select>
				<Select name="priority" label={t('priority')} onChange={handleSelectChange}>
					<option value="">{t('all')}</option>
					<option value="high">{t('high')}</option>
					<option value="medium">{t('medium')}</option>
					<option value="low">{t('low')}</option>
				</Select>
				<Select name="species" label={t('species')} onChange={handleSelectChange}>
					<option value="">{t('all')}</option>
					{farm?.species.map((species, index) => (
						<option key={index} value={species}>
							{species}
						</option>
					))}
				</Select>
				<Button onClick={handleAddTask}>{t('addTask')}</Button>
			</S.Filters>

			{filters.status !== 'COMPLETED' && (
				<>
					<S.StatusTitle>{t('pending')}</S.StatusTitle>
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
						{tasks && tasks.pending.length === 0 && <S.NoTasks>{t('noTasks')}</S.NoTasks>}
					</S.TasksList>
				</>
			)}

			{filters.status !== 'PENDING' && (
				<>
					<S.StatusTitle>{t('completed')}</S.StatusTitle>
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
						{tasks && tasks.completed.length === 0 && <S.NoTasks>{t('noTasks')}</S.NoTasks>}
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
