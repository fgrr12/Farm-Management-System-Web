import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { memo, useCallback, useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AppRoutes } from '@/config/constants/routes'

import { useFarmStore } from '@/store/useFarmStore'
import { useUserStore } from '@/store/useUserStore'

import { TasksService } from '@/services/tasks'

import { TaskColumn } from '@/components/business/Tasks/TaskColumn'
import { TaskFilters } from '@/components/business/Tasks/TaskFilters'
import { TaskModal } from '@/components/business/Tasks/TaskModal'
import { Button } from '@/components/ui/Button'

import { usePagePerformance } from '@/hooks/ui/usePagePerformance'

import type { TaskColumnInfo, TaskColumns, TaskFilters as TaskFiltersType } from './Tasks.types'

const Tasks = () => {
	const baseId = useId()
	const { user } = useUserStore()
	const { farm, species } = useFarmStore()
	const navigate = useNavigate()
	const { t } = useTranslation(['tasks'])
	const { setPageTitle, showToast, withLoadingAndError } = usePagePerformance()

	const [taskColumns, setTaskColumns] = useState<TaskColumns>(INITIAL_TASK_COLUMNS)
	const [filters, setFilters] = useState<TaskFiltersType>(INITIAL_FILTERS)
	const [selectedTask, setSelectedTask] = useState<Task | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const handleAddTask = useCallback(() => {
		navigate(AppRoutes.ADD_TASK)
	}, [navigate])

	const handleFiltersChange = useCallback((newFilters: TaskFiltersType) => {
		setFilters(newFilters)
	}, [])

	const handleTaskClick = useCallback((task: Task) => {
		setSelectedTask(task)
		setIsModalOpen(true)
	}, [])

	const handleCloseModal = useCallback(() => {
		setIsModalOpen(false)
		setSelectedTask(null)
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

			// Group tasks by status (only show active columns)
			const groupedTasks: TaskColumns = {
				todo: tasks.filter((task) => task.status === 'todo'),
				'in-progress': tasks.filter((task) => task.status === 'in-progress'),
				done: tasks.filter((task) => task.status === 'done'),
			}

			setTaskColumns(groupedTasks)
		}, t('toast.errorGettingTasks'))
	}, [farm?.uuid, filters, withLoadingAndError, t])

	const handleTaskMove = useCallback(
		async (taskId: string, fromStatus: TaskStatus, toStatus: TaskStatus) => {
			if (fromStatus === toStatus) return

			await withLoadingAndError(async () => {
				await TasksService.updateTaskStatus(taskId, toStatus, user!.uuid, farm!.uuid)
				await getTasks()

				showToast(
					t('toast.taskMoved', {
						status: t(`status.${toStatus}`),
					}),
					'success'
				)
			}, t('toast.errorUpdatingTaskStatus'))
		},
		[farm, user, getTasks, showToast, t, withLoadingAndError]
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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto">
			<div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
				<a
					href="#kanban-board"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 dark:bg-blue-500 text-white p-2 rounded z-50"
				>
					{t('accessibility.skipToTasks')}
				</a>

				{/* Hero Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden mb-6 sm:mb-8">
					<div className="bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-700 dark:to-green-700 px-4 sm:px-6 py-6 sm:py-8">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex items-center gap-3 sm:gap-4">
								<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 dark:bg-white/30 rounded-full flex items-center justify-center flex-shrink-0">
									<i className="i-material-symbols-task bg-white! w-6! h-6! sm:w-8 sm:h-8" />
								</div>
								<div className="min-w-0">
									<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
										{t('title')}
									</h1>
									<p className="text-blue-100 dark:text-blue-200 text-sm sm:text-base mt-1">
										{t('subtitle')}
									</p>
								</div>
							</div>

							<div className="flex gap-2 sm:gap-4">
								<div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
									<div className="text-lg sm:text-xl font-bold text-white">
										{taskColumns.todo.length + taskColumns['in-progress'].length}
									</div>
									<div className="text-xs text-blue-100 dark:text-blue-200">{t('activeTasks')}</div>
								</div>
								<div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
									<div className="text-lg sm:text-xl font-bold text-white">
										{taskColumns.done.length}
									</div>
									<div className="text-xs text-blue-100 dark:text-blue-200">
										{t('completedTasks')}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Actions Bar */}
					<div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
						<div className="flex items-center justify-between gap-4">
							<div className="flex-1 max-w-md">
								<TaskFilters
									filters={filters}
									onFiltersChange={handleFiltersChange}
									species={species}
								/>
							</div>

							<div className="flex-shrink-0">
								<Button
									onClick={handleAddTask}
									aria-describedby="add-task-description"
									className="btn btn-primary h-12 text-base sm:text-lg px-6 sm:px-8 dark:bg-blue-600 dark:hover:bg-blue-700"
								>
									<i className="i-material-symbols-add-circle-outline w-5! h-5! mr-2" />
									{t('addTask')}
								</Button>
								<div id={`${baseId}-add-task-description`} className="sr-only">
									{t('accessibility.addTaskDescription')}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Kanban Board */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden">
					<main id={`${baseId}-kanban-board`} className="p-4 sm:p-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 min-h-[600px]">
							{COLUMN_CONFIG.map((column) => (
								<TaskColumn
									key={column.id}
									status={column.id}
									title={t(`status.${column.id}`)}
									tasks={taskColumns[column.id]}
									color={column.color}
									bgColor={column.bgColor}
									onTaskClick={handleTaskClick}
								/>
							))}
						</div>
					</main>
				</div>
			</div>

			{/* Task Modal */}
			<TaskModal task={selectedTask} isOpen={isModalOpen} onClose={handleCloseModal} />
		</div>
	)
}

const INITIAL_TASK_COLUMNS: TaskColumns = {
	todo: [],
	'in-progress': [],
	done: [],
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
]

export default memo(Tasks)
