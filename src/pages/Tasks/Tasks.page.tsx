import { type ChangeEvent, memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { TasksService } from '@/services/tasks'

import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { Select } from '@/components/ui/Select'

import { usePagePerformance } from '@/hooks/usePagePerformance'

import type { DividedTasks, TaskFilters } from './Tasks.types'

const Tasks = () => {
	const { user } = useUserStore()
	const { farm, species } = useFarmStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['tasks'])
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const [tasks, setTasks] = useState(INITIAL_TASKS)
	const [filters, setFilters] = useState(INITIAL_FILTERS)

	const handleAddTask = useCallback(() => {
		navigate(AppRoutes.ADD_TASK)
	}, [navigate])

	const handleDebounceSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setFilters((prev) => ({ ...prev, search: event.target.value }))
	}, [])

	const handleSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = event.target
		setFilters((prev) => ({ ...prev, [name]: value }))
	}, [])

	const getTasks = useCallback(async () => {
		await withLoadingAndError(
			async () => {
				if (!farm?.uuid) return []

				const { search, status, priority, speciesUuid } = filters
				const farmUuid = farm.uuid
				const tasks = await TasksService.getTasks({ search, status, priority, speciesUuid, farmUuid })
				const pendingTasks = tasks.filter((task) => task.status === 'PENDING')
				const completedTasks = tasks.filter((task) => task.status === 'COMPLETED')
				setTasks({ pending: pendingTasks, completed: completedTasks })
				return tasks
			},
			t('toast.errorGettingTasks')
		)
	}, [farm?.uuid, filters, withLoadingAndError, t])

	const handleUpdateTask = useCallback(
		(task: Task) => async () => {
			await withLoadingAndError(async () => {
				const status = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
				await TasksService.updateTaskStatus(task.uuid, status)
				await getTasks()
				showToast(
					status === 'COMPLETED'
						? t('toast.taskCompleted', { taskUuid: task.title })
						: t('toast.taskPending', { taskUuid: task.title }),
					status === 'COMPLETED' ? 'success' : 'warning'
				)
			}, t('toast.errorUpdatingTaskStatus'))
		},
		[getTasks, showToast, t, withLoadingAndError]
	)

	const handlePriorityColor = useCallback((priority: string) => {
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
	}, [])

	// biome-ignore lint:: UseEffect used to update tasks list
	useEffect(() => {
		if (!user) return
		getTasks()
	}, [user, filters.priority, filters.speciesUuid, filters.status, getTasks])

	useEffect(() => {
		const debounceId = setTimeout(() => {
			if (filters.search !== '') getTasks()
		}, 500)
		return () => clearTimeout(debounceId)
	}, [filters.search, getTasks])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

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
					name="speciesUuid"
					legend={t('filterBySpecies')}
					defaultLabel={t('filterBySpecies')}
					optionValue="uuid"
					optionLabel="name"
					value={filters.speciesUuid}
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
	speciesUuid: '',
}

export default memo(Tasks)
