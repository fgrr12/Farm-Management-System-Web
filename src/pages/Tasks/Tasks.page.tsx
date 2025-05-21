import { type ChangeEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useAppStore } from '@/store/useAppStore'
import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { TasksService } from '@/services/tasks'

import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { Select } from '@/components/ui/Select'

import type { DividedTasks, TaskFilters } from './Tasks.types'

export const Tasks = () => {
	const { user } = useUserStore()
	const { farm } = useFarmStore()
	const { setHeaderTitle, setLoading } = useAppStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['tasks'])

	const [tasks, setTasks] = useState(INITIAL_TASKS)
	const [species, setSpecies] = useState(INITIAL_SPECIES)
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

	const handlePriorityColor = (priority: string) => {
		switch (priority) {
			case 'low':
				return 'bg-green-500'
			case 'medium':
				return 'bg-yellow-500'
			case 'high':
				return 'bg-red-500'
			default:
				return 'bg-gray-500'
		}
	}

	// biome-ignore lint:: UseEffect used to update tasks list
	useEffect(() => {
		if (!user) return
		getTasks()
		setSpecies(farm!.species!)
	}, [user, filters.priority, filters.species, filters.status])

	// biome-ignore lint:: UseEffect is only watching for search changes
	useEffect(() => {
		const debounceId = setTimeout(() => {
			if (filters.search !== '') getTasks()
		}, 500)
		return () => clearTimeout(debounceId)
	}, [filters.search])

	useEffect(() => {
		setHeaderTitle(t('title'))
	}, [setHeaderTitle, t])

	return (
		<div className="flex flex-col gap-4 p-4 w-full h-full">
			<div className="flex flex-col md:grid md:grid-cols-6 items-center justify-center gap-4 w-full">
				<Search placeholder={t('search')} onChange={handleDebounceSearch} />
				<Select
					name="status"
					legend={t('filterByStatus')}
					defaultLabel={t('filterByStatus')}
					value={filters.status}
					items={[
						{ value: 'COMPLETED', name: t('completed') },
						{ value: 'PENDING', name: t('pending') },
					]}
					onChange={handleSelectChange}
				/>
				<Select
					name="priority"
					legend={t('filterByPriority')}
					defaultLabel={t('filterByPriority')}
					value={filters.priority}
					items={[
						{ value: 'high', name: t('high') },
						{ value: 'medium', name: t('medium') },
						{ value: 'low', name: t('low') },
					]}
					onChange={handleSelectChange}
				/>
				<Select
					name="species"
					legend={t('filterBySpecies')}
					defaultLabel={t('filterBySpecies')}
					optionValue="uuid"
					optionLabel="name"
					value={filters.species}
					items={species}
					onChange={handleSelectChange}
				/>
				<div className="col-start-6 w-full">
					<Button onClick={handleAddTask}>{t('addTask')}</Button>
				</div>
			</div>

			{filters.status !== 'COMPLETED' && (
				<>
					<h2 className="text-2xl font-semibold">{t('pending')}</h2>
					<div className="flex flex-col gap-4 p-4 w-full border-2 rounded-xl border-gray-300">
						{tasks.pending.map((task) => (
							<div
								key={task.uuid}
								className="flex flex-row gap-4 items-center p-4 w-full border-2 rounded-xl border-gray-300 relative"
							>
								<input
									type="checkbox"
									className="checkbox checkbox-success"
									onChange={handleUpdateTask(task)}
								/>
								<div className="flex flex-col w-[85%] sm:w-[90%]">
									<h2 className="text-xl font-semibold">{task.title}</h2>
									<p>{task.description}</p>
								</div>
								<div
									className={`${handlePriorityColor(task.priority)} absolute right-0 top-0 bottom-0 w-10 rounded-r-lg`}
								/>
							</div>
						))}
						{tasks && tasks.pending.length === 0 && (
							<div className="text-center text-2xl font-semibold">{t('noTasks')}</div>
						)}
					</div>
				</>
			)}

			{filters.status !== 'PENDING' && (
				<>
					<h2 className="text-2xl font-semibold">{t('completed')}</h2>
					<div className="flex flex-col gap-4 p-4 w-full border-2 rounded-xl border-gray-300">
						{tasks.completed.map((task) => (
							<div
								key={task.uuid}
								className="flex flex-row gap-4 items-center p-4 w-full border-2 rounded-xl border-gray-300 relative"
							>
								<input
									type="checkbox"
									className="checkbox checkbox-success"
									onChange={handleUpdateTask(task)}
									checked
								/>
								<div className="flex flex-col w-[85%] sm:w-[90%]">
									<h2 className="text-xl font-semibold">{task.title}</h2>
									<p>{task.description}</p>
								</div>
								<div
									className={`${handlePriorityColor(task.priority)} absolute right-0 top-0 bottom-0 w-10 rounded-r-lg`}
								/>
							</div>
						))}
						{tasks && tasks.completed.length === 0 && (
							<div className="text-center text-2xl font-semibold">{t('noTasks')}</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}

const INITIAL_TASKS: DividedTasks = { pending: [], completed: [] }

const INITIAL_FILTERS: TaskFilters = {
	search: '',
	status: '',
	priority: '',
	species: '',
}

const INITIAL_SPECIES: Species[] = [
	{
		uuid: crypto.randomUUID(),
		name: '',
		breeds: [
			{
				uuid: crypto.randomUUID(),
				name: '',
				gestationPeriod: 0,
			},
		],
		status: true,
	},
]
