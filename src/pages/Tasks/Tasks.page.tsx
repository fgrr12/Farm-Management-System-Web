import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { TasksService } from '@/services/tasks'

import { TaskColumn } from '@/components/business/Tasks/TaskColumn'
import { TaskFilters } from '@/components/business/Tasks/TaskFilters'
import { Button } from '@/components/ui/Button'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { TaskColumnInfo, TaskColumns, TaskFilters as TaskFiltersType } from './Tasks.types'

const Tasks = () => {
	const { user } = useUserStore()
	const { farm, species } = useFarmStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['tasks'])
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const [taskColumns, setTaskColumns] = useState<TaskColumns>(INITIAL_TASK_COLUMNS)
	const [filters, setFilters] = useState<TaskFiltersType>(INITIAL_FILTERS)

	const handleAddTask = useCallback(() => {
		navigate(AppRoutes.ADD_TASK)
	}, [navigate])

	const handleFiltersChange = useCallback((newFilters: TaskFiltersType) => {
		setFilters(newFilters)
	}, [])

	const getTasks = useCallback(async () => {
		await withLoadingAndError(async () => {
			if (!farm?.uuid) return

			const { priority, speciesUuid } = filters
			const farmUuid = farm.uuid
			const tasks = await TasksService.getTasks({
				search: '', // No global search, each column has its own
				status: '', // Get all statuses for kanban
				priority,
				speciesUuid,
				farmUuid,
			})

			// Group tasks by status
			const groupedTasks: TaskColumns = {
				todo: tasks.filter((task) => task.status === 'todo'),
				'in-progress': tasks.filter((task) => task.status === 'in-progress'),
				done: tasks.filter((task) => task.status === 'done'),
				archived: tasks.filter((task) => task.status === 'archived'),
			}

			setTaskColumns(groupedTasks)
		}, t('toast.errorGettingTasks'))
	}, [farm?.uuid, filters, withLoadingAndError, t])

	const handleTaskMove = useCallback(
		async (taskId: string, fromStatus: TaskStatus, toStatus: TaskStatus) => {
			if (fromStatus === toStatus) return

			await withLoadingAndError(async () => {
				await TasksService.updateTaskStatus(taskId, toStatus)
				await getTasks()

				showToast(
					t('toast.taskMoved', {
						status: t(`status.${toStatus}`),
					}),
					'success'
				)
			}, t('toast.errorUpdatingTaskStatus'))
		},
		[getTasks, showToast, t, withLoadingAndError]
	)

	// Drag and drop monitor
	useEffect(() => {
		return monitorForElements({
			onDrop({ source, location }) {
				const destination = location.current.dropTargets[0]
				if (!destination) return

				const taskId = source.data.taskId as string
				const currentStatus = source.data.currentStatus as TaskStatus
				const newStatus = destination.data.status as TaskStatus

				if (currentStatus !== newStatus) {
					handleTaskMove(taskId, currentStatus, newStatus)
				}
			},
		})
	}, [handleTaskMove])

	//biome-ignore lint: only the required
	useEffect(() => {
		if (!user) return
		getTasks()
	}, [user, filters.priority, filters.speciesUuid, getTasks])

	useEffect(() => {
		setPageTitle(t('title'))
	}, [setPageTitle, t])

	return (
		<div className="flex flex-col gap-4 p-4 w-full h-full">
			<a
				href="#kanban-board"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50"
			>
				{t('accessibility.skipToTasks')}
			</a>

			{/* Top Bar with Filters and Add Button */}
			<header className="flex items-center justify-between gap-4">
				<div className="flex-shrink-0">
					<TaskFilters filters={filters} onFiltersChange={handleFiltersChange} species={species} />
				</div>

				<div className="flex-shrink-0">
					<Button onClick={handleAddTask} aria-describedby="add-task-description">
						{t('addTask')}
					</Button>
					<div id="add-task-description" className="sr-only">
						{t('accessibility.addTaskDescription')}
					</div>
				</div>
			</header>

			{/* Kanban Board */}
			<main id="kanban-board" className="flex-1 overflow-y-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
					{COLUMN_CONFIG.map((column) => (
						<TaskColumn
							key={column.id}
							status={column.id}
							title={t(`status.${column.id}`)}
							tasks={taskColumns[column.id]}
							color={column.color}
							bgColor={column.bgColor}
						/>
					))}
				</div>
			</main>
		</div>
	)
}

const INITIAL_TASK_COLUMNS: TaskColumns = {
	todo: [],
	'in-progress': [],
	done: [],
	archived: [],
}

const INITIAL_FILTERS: TaskFiltersType = {
	priority: '',
	speciesUuid: '',
}

const COLUMN_CONFIG: TaskColumnInfo[] = [
	{
		id: 'todo',
		title: 'To Do',
		color: 'gray-500',
		bgColor: 'gray-50',
	},
	{
		id: 'in-progress',
		title: 'In Progress',
		color: 'blue-500',
		bgColor: 'blue-50',
	},
	{
		id: 'done',
		title: 'Done',
		color: 'green-500',
		bgColor: 'green-50',
	},
	{
		id: 'archived',
		title: 'Archived',
		color: 'purple-500',
		bgColor: 'purple-50',
	},
]

export default memo(Tasks)
