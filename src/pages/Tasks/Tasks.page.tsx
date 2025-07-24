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

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

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
		await withLoadingAndError(async () => {
			if (!farm?.uuid) return []

			const { search, status, priority, speciesUuid } = filters
			const farmUuid = farm.uuid
			const tasks = await TasksService.getTasks({ search, status, priority, speciesUuid, farmUuid })
			const pendingTasks = tasks.filter((task) => task.status === 'PENDING')
			const completedTasks = tasks.filter((task) => task.status === 'COMPLETED')
			setTasks({ pending: pendingTasks, completed: completedTasks })
			return tasks
		}, t('toast.errorGettingTasks'))
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
		<div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 w-full h-full">
			<a
				href="#tasks-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
			>
				{t('accessibility.skipToTasks')}
			</a>

			<header>
				<h1 className="sr-only">{t('title')}</h1>
			</header>

			<section aria-labelledby="filters-heading" role="search">
				<h2 id="filters-heading" className="sr-only">
					{t('accessibility.filtersSection')}
				</h2>
				<div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-6 items-center justify-center gap-3 sm:gap-4 w-full">
					<Search
						placeholder={t('search')}
						onChange={handleDebounceSearch}
						aria-label={t('accessibility.searchTasks')}
					/>
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
						aria-label={t('filterByStatus')}
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
						aria-label={t('filterByPriority')}
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
						aria-label={t('filterBySpecies')}
					/>
					<div className="sm:col-span-2 lg:col-start-6 lg:col-span-1 w-full">
						<Button onClick={handleAddTask} aria-describedby="add-task-description">
							{t('addTask')}
						</Button>
						<div id="add-task-description" className="sr-only">
							{t('accessibility.addTaskDescription')}
						</div>
					</div>
				</div>
			</section>

			<div id="tasks-content">
				{filters.status !== 'COMPLETED' && (
					<section aria-labelledby="pending-tasks-heading" aria-live="polite">
						<h2 id="pending-tasks-heading" className="text-2xl font-semibold">
							{t('pending')} ({tasks.pending.length})
						</h2>
						<div
							className="flex flex-col gap-4 p-4 w-full border-2 rounded-xl border-gray-300"
							role="list"
							aria-label={t('accessibility.pendingTasksList', { count: tasks.pending.length })}
						>
							{tasks.pending.map((task) => (
								<div
									key={task.uuid}
									className="flex flex-row gap-4 items-center p-4 w-full border-2 rounded-xl border-gray-300 relative"
									role="listitem"
									aria-labelledby={`task-${task.uuid}-title`}
									aria-describedby={`task-${task.uuid}-description task-${task.uuid}-priority`}
								>
									<input
										type="checkbox"
										className="checkbox checkbox-success"
										onChange={handleUpdateTask(task)}
										aria-label={t('accessibility.markTaskComplete', { title: task.title })}
										aria-describedby={`task-${task.uuid}-status-help`}
									/>
									<div id={`task-${task.uuid}-status-help`} className="sr-only">
										{t('accessibility.taskStatusHelp')}
									</div>

									<div className="flex flex-col w-[85%] sm:w-[90%]">
										<h3 id={`task-${task.uuid}-title`} className="text-xl font-semibold">
											{task.title}
										</h3>
										<p id={`task-${task.uuid}-description`}>{task.description}</p>
									</div>

									<div
										className={`${handlePriorityColor(task.priority)} absolute right-0 top-0 bottom-0 w-10 rounded-r-lg`}
										role="img"
										aria-label={t('accessibility.priorityIndicator', { priority: task.priority })}
										id={`task-${task.uuid}-priority`}
									/>
								</div>
							))}
							{tasks && tasks.pending.length === 0 && (
								<div className="text-center text-2xl font-semibold" role="status">
									{t('noTasks')}
								</div>
							)}
						</div>
					</section>
				)}

				{filters.status !== 'PENDING' && (
					<section aria-labelledby="completed-tasks-heading" aria-live="polite">
						<h2 id="completed-tasks-heading" className="text-2xl font-semibold">
							{t('completed')} ({tasks.completed.length})
						</h2>
						<div
							className="flex flex-col gap-4 p-4 w-full border-2 rounded-xl border-gray-300"
							role="list"
							aria-label={t('accessibility.completedTasksList', { count: tasks.completed.length })}
						>
							{tasks.completed.map((task) => (
								<div
									key={task.uuid}
									className="flex flex-row gap-4 items-center p-4 w-full border-2 rounded-xl border-gray-300 relative"
									role="listitem"
									aria-labelledby={`task-${task.uuid}-title`}
									aria-describedby={`task-${task.uuid}-description task-${task.uuid}-priority`}
								>
									<input
										type="checkbox"
										className="checkbox checkbox-success"
										onChange={handleUpdateTask(task)}
										checked
										aria-label={t('accessibility.markTaskPending', { title: task.title })}
										aria-describedby={`task-${task.uuid}-status-help`}
									/>
									<div id={`task-${task.uuid}-status-help`} className="sr-only">
										{t('accessibility.completedTaskStatusHelp')}
									</div>

									<div className="flex flex-col w-[85%] sm:w-[90%]">
										<h3 id={`task-${task.uuid}-title`} className="text-xl font-semibold">
											{task.title}
										</h3>
										<p id={`task-${task.uuid}-description`}>{task.description}</p>
									</div>

									<div
										className={`${handlePriorityColor(task.priority)} absolute right-0 top-0 bottom-0 w-10 rounded-r-lg`}
										role="img"
										aria-label={t('accessibility.priorityIndicator', { priority: task.priority })}
										id={`task-${task.uuid}-priority`}
									/>
								</div>
							))}
							{tasks && tasks.completed.length === 0 && (
								<div className="text-center text-2xl font-semibold" role="status">
									{t('noTasks')}
								</div>
							)}
						</div>
					</section>
				)}
			</div>
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
